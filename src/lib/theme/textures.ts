/**
 * Procedural canvas textures for the hero scene.
 *
 * Everything here is painted at runtime so the repo carries no image assets:
 * each painter draws a tileable pattern into a 2D canvas which is then handed
 * to three.js as a map / roughnessMap / normalMap.
 */

export type Painter = (ctx: CanvasRenderingContext2D, size: number) => void;

type TextureOptions = {
	size?: number;
	repeat?: number;
	/**
	 * Remap the painted greyscale into [lo, hi] before it becomes a data map.
	 * roughnessMap/metalnessMap MULTIPLY the scalar on the material, so a
	 * mid-grey noise map silently halves the value you asked for.
	 */
	levels?: [number, number];
	/** Convert the painted greyscale height field into a tangent-space normal map. */
	asNormal?: boolean;
	/** Normal map strength, only used with asNormal. */
	strength?: number;
	/** Colour data needs sRGB; data maps (roughness/normal) stay linear. */
	srgb?: boolean;
};

const cache = new Map<string, any>();

function paintCanvas(painter: Painter, size: number) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2D canvas context unavailable');
	ctx.fillStyle = '#808080';
	ctx.fillRect(0, 0, size, size);
	painter(ctx, size);
	return { canvas, ctx };
}

/** Squeeze a painted greyscale into [lo, hi] so multiplied data maps stay honest. */
function applyLevels(canvas: HTMLCanvasElement, lo: number, hi: number) {
	const ctx = canvas.getContext('2d')!;
	const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = image.data;
	for (let i = 0; i < data.length; i += 4) {
		const v = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
		const out = (lo + v * (hi - lo)) * 255;
		data[i] = data[i + 1] = data[i + 2] = out;
	}
	ctx.putImageData(image, 0, 0);
}

/** Sobel-style height -> tangent space normal conversion. */
function toNormalMap(source: HTMLCanvasElement, strength: number) {
	const size = source.width;
	const src = source.getContext('2d')!.getImageData(0, 0, size, size).data;
	const out = document.createElement('canvas');
	out.width = size;
	out.height = size;
	const ctx = out.getContext('2d')!;
	const image = ctx.createImageData(size, size);

	const height = (x: number, y: number) => {
		const xi = ((x % size) + size) % size;
		const yi = ((y % size) + size) % size;
		const i = (yi * size + xi) * 4;
		return (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
	};

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx =
				height(x - 1, y - 1) + 2 * height(x - 1, y) + height(x - 1, y + 1) -
				(height(x + 1, y - 1) + 2 * height(x + 1, y) + height(x + 1, y + 1));
			const dy =
				height(x - 1, y - 1) + 2 * height(x, y - 1) + height(x + 1, y - 1) -
				(height(x - 1, y + 1) + 2 * height(x, y + 1) + height(x + 1, y + 1));

			// three.js expects OpenGL-convention normal maps (+G points along +V),
			// and CanvasTexture uploads with flipY, so the v derivative is negated.
			const nx = dx * strength;
			const ny = -dy * strength;
			const nz = 1;
			const len = Math.hypot(nx, ny, nz) || 1;
			const i = (y * size + x) * 4;
			image.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
			image.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
			image.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
			image.data[i + 3] = 255;
		}
	}

	ctx.putImageData(image, 0, 0);
	return out;
}

/** Build (and memoise) a three.js texture from a painter function. */
export function canvasTexture(THREE: any, key: string, painter: Painter, options: TextureOptions = {}) {
	const { size = 512, repeat = 1, asNormal = false, strength = 2, srgb = false, levels } = options;
	const cacheKey = `${key}|${size}|${repeat}|${asNormal}|${strength}|${srgb}|${levels ?? ''}`;
	if (cache.has(cacheKey)) return cache.get(cacheKey);

	const { canvas } = paintCanvas(painter, size);
	if (levels && !asNormal) applyLevels(canvas, levels[0], levels[1]);
	const source = asNormal ? toNormalMap(canvas, strength) : canvas;

	const texture = new THREE.CanvasTexture(source);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(repeat, repeat);
	texture.anisotropy = 8;
	if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
	texture.needsUpdate = true;

	cache.set(cacheKey, texture);
	return texture;
}

/**
 * A tiny N-step ramp used as a MeshToonMaterial gradientMap.
 * The toon shader reads only the RED channel and multiplies it into the
 * material colour, so the stops must be greyscale and must NOT be sRGB.
 */
export function toonRamp(THREE: any, key: string, stops: string[]) {
	const cacheKey = `ramp|${key}|${stops.join(',')}`;
	if (cache.has(cacheKey)) return cache.get(cacheKey);

	const canvas = document.createElement('canvas');
	canvas.width = stops.length;
	canvas.height = 1;
	const ctx = canvas.getContext('2d')!;
	stops.forEach((stop, i) => {
		ctx.fillStyle = stop;
		ctx.fillRect(i, 0, 1, 1);
	});

	const texture = new THREE.CanvasTexture(canvas);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;

	cache.set(cacheKey, texture);
	return texture;
}

/* ---------------------------------------------------------------------- */
/* Painters                                                                */
/* ---------------------------------------------------------------------- */

/** Deterministic hash noise so patterns are stable between reloads. */
function noise(x: number, y: number, seed = 1) {
	const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
	return n - Math.floor(n);
}

/** Fine random speckle — reads as unglazed clay / plaster / paper grain. */
export const grain: Painter = (ctx, size) => {
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const v = 118 + noise(x, y) * 34 + noise(x * 0.25, y * 0.25, 3) * 30;
			const i = (y * size + x) * 4;
			image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
};

/** Horizontal streaks — brushed / satin metal. */
export const brushed: Painter = (ctx, size) => {
	ctx.fillStyle = '#7d7d7d';
	ctx.fillRect(0, 0, size, size);
	for (let i = 0; i < size * 6; i++) {
		const y = Math.floor(noise(i, 17, 5) * size);
		const shade = 96 + noise(i, 31, 9) * 72;
		ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
		ctx.lineWidth = 0.6 + noise(i, 3, 11) * 1.4;
		ctx.beginPath();
		ctx.moveTo(0, y + 0.5);
		ctx.lineTo(size, y + 0.5);
		ctx.stroke();
	}
};

/** Overlapping dimples — beaten / planished metal. */
export const hammered: Painter = (ctx, size) => {
	ctx.fillStyle = '#6e6e6e';
	ctx.fillRect(0, 0, size, size);
	const cells = 7;
	const step = size / cells;
	for (let gy = -1; gy <= cells; gy++) {
		for (let gx = -1; gx <= cells; gx++) {
			const jitterX = (noise(gx, gy, 21) - 0.5) * step * 0.5;
			const jitterY = (noise(gx, gy, 33) - 0.5) * step * 0.5;
			const cx = gx * step + step / 2 + jitterX;
			const cy = gy * step + step / 2 + jitterY;
			const r = step * (0.42 + noise(gx, gy, 47) * 0.22);
			const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
			g.addColorStop(0, 'rgba(255,255,255,0.55)');
			g.addColorStop(0.6, 'rgba(128,128,128,0.25)');
			g.addColorStop(1, 'rgba(0,0,0,0.35)');
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};

/** Over-under weave — carbon fibre / technical fabric. */
export const weave: Painter = (ctx, size) => {
	const cells = 8;
	const step = size / cells;
	ctx.fillStyle = '#5a5a5a';
	ctx.fillRect(0, 0, size, size);
	for (let gy = 0; gy < cells; gy++) {
		for (let gx = 0; gx < cells; gx++) {
			const horizontal = (gx + gy) % 2 === 0;
			const x = gx * step;
			const y = gy * step;
			const g = horizontal
				? ctx.createLinearGradient(x, y, x, y + step)
				: ctx.createLinearGradient(x, y, x + step, y);
			g.addColorStop(0, '#3c3c3c');
			g.addColorStop(0.5, '#d2d2d2');
			g.addColorStop(1, '#3c3c3c');
			ctx.fillStyle = g;
			ctx.fillRect(x, y, step, step);
		}
	}
};

/** Marble veining: a few soft primaries with hairlines drifting off them. */
export function veined(base: string, vein: string): Painter {
	return (ctx, size) => {
		ctx.fillStyle = base;
		ctx.fillRect(0, 0, size, size);
		ctx.lineCap = 'round';
		ctx.filter = 'blur(2.5px)';
		const strokes = 14;
		for (let v = 0; v < strokes; v++) {
			const primary = v % 4 === 0;
			const offset = (v / strokes) * size * 2 - size * 0.6;
			const amplitude = size * (0.08 + noise(v, 7, 13) * 0.16);
			const wobble = 0.8 + noise(v, 11, 19) * 1.6;
			ctx.strokeStyle = vein;
			ctx.globalAlpha = primary ? 0.16 + noise(v, 5, 23) * 0.12 : 0.05 + noise(v, 5, 23) * 0.07;
			ctx.lineWidth = primary ? 3 + noise(v, 9, 29) * 5 : 0.8 + noise(v, 9, 29) * 1.6;
			ctx.beginPath();
			for (let x = 0; x <= size; x += 6) {
				const t = x / size;
				const y =
					offset +
					x * 0.55 +
					Math.sin(t * Math.PI * wobble) * amplitude +
					Math.sin(t * Math.PI * wobble * 3.7) * amplitude * 0.22;
				const yy = ((y % size) + size) % size;
				if (x === 0) ctx.moveTo(x, yy);
				else ctx.lineTo(x, yy);
			}
			ctx.stroke();
		}
		ctx.filter = 'none';
		ctx.globalAlpha = 1;
	};
}

/**
 * Oxidation blooms over bare metal. `patina` paints the colour map; `patinaMask`
 * paints the same blooms as a black-on-white mask, so metalness/roughness line
 * up with the colour exactly (both walk the same noise sequence).
 */
/** Offsets for the 8 neighbouring tiles, so a bloom drawn near an edge wraps. */
const WRAP_DIRS = [
	[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]
] as const;

function blooms(
	ctx: CanvasRenderingContext2D,
	size: number,
	colourAt: (i: number) => string,
	fade: string
) {
	for (let i = 0; i < 64; i++) {
		const cx = noise(i, 2, 37) * size;
		const cy = noise(i, 4, 41) * size;
		const r = size * (0.018 + noise(i, 6, 43) * 0.055);
		const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
		gradient.addColorStop(0, colourAt(i));
		gradient.addColorStop(0.75, colourAt(i));
		gradient.addColorStop(1, fade);
		ctx.fillStyle = gradient;
		for (const [dx, dy] of WRAP_DIRS) {
			ctx.beginPath();
			ctx.arc(cx + dx * size, cy + dy * size, r, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

export function patina(metal: string, oxide: string, oxideAlt: string): Painter {
	return (ctx, size) => {
		ctx.fillStyle = metal;
		ctx.fillRect(0, 0, size, size);
		blooms(ctx, size, (i) => (noise(i, 8, 53) > 0.5 ? oxide : oxideAlt), 'rgba(0,0,0,0)');
	};
}

/** White where bare metal survives, black where the oxide sits. */
export function patinaMask(bare = '#ffffff', oxide = '#101010'): Painter {
	return (ctx, size) => {
		ctx.fillStyle = bare;
		ctx.fillRect(0, 0, size, size);
		blooms(ctx, size, () => oxide, 'rgba(255,255,255,0)');
	};
}

/** Soft cloudy variation — used for roughness break-up on otherwise flat materials. */
export const clouds: Painter = (ctx, size) => {
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let v = 0;
			let amp = 0.5;
			let freq = 0.02;
			for (let o = 0; o < 4; o++) {
				v += amp * (Math.sin(x * freq + noise(o, 1, 59) * 6.28) * Math.cos(y * freq * 1.3 + noise(o, 2, 61) * 6.28));
				amp *= 0.5;
				freq *= 2.1;
			}
			const i = (y * size + x) * 4;
			const c = 128 + v * 110;
			image.data[i] = image.data[i + 1] = image.data[i + 2] = Math.max(0, Math.min(255, c));
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
};
