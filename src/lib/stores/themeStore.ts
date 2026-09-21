import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { palettes, defaultPaletteId, type Palette } from '$lib/theme/palettes';
import { materialPresets, defaultMaterialId, type MaterialPreset } from '$lib/theme/materials';
import { backdrops, defaultBackdropId, type Backdrop } from '$lib/theme/backdrops';

const STORAGE_KEY = 'portfolio-theme';

function findPalette(id: string | null | undefined): Palette {
	return palettes.find((p) => p.id === id) ?? palettes.find((p) => p.id === defaultPaletteId)!;
}

function findMaterial(id: string | null | undefined): MaterialPreset {
	return (
		materialPresets.find((m) => m.id === id) ??
		materialPresets.find((m) => m.id === defaultMaterialId)!
	);
}

function findBackdrop(id: string | null | undefined): Backdrop {
	return backdrops.find((b) => b.id === id) ?? backdrops.find((b) => b.id === defaultBackdropId)!;
}

function readInitial() {
	const fallback = {
		palette: defaultPaletteId,
		material: defaultMaterialId,
		backdrop: defaultBackdropId,
		lab: false
	};
	if (!browser) return fallback;

	let stored: { palette?: string; material?: string; backdrop?: string } = {};
	try {
		stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
	} catch {
		stored = {};
	}

	// URL wins over localStorage so a shared link always shows what it promises.
	const params = new URLSearchParams(window.location.search);
	const paletteParam = params.get('palette') || params.get('theme');
	const materialParam = params.get('material') || params.get('mat');
	const backdropParam = params.get('backdrop') || params.get('bg');

	return {
		palette: findPalette(paletteParam || stored.palette).id,
		material: findMaterial(materialParam || stored.material).id,
		backdrop: findBackdrop(backdropParam || stored.backdrop).id,
		lab: params.get('lab') === '1' || params.get('lab') === 'true'
	};
}

const initial = readInitial();

export const paletteId = writable<string>(initial.palette);
export const materialId = writable<string>(initial.material);
export const backdropId = writable<string>(initial.backdrop);
// Starts closed so the server and the first client render agree; the layout
// opens it from the URL after mount.
export const labOpen = writable<boolean>(false);
export const labRequested = initial.lab;

export const activePalette = derived(paletteId, ($id) => findPalette($id));
export const activeMaterial = derived(materialId, ($id) => findMaterial($id));
export const activeBackdrop = derived(backdropId, ($id) => findBackdrop($id));

export function setPalette(id: string) {
	paletteId.set(findPalette(id).id);
}

export function setMaterial(id: string) {
	materialId.set(findMaterial(id).id);
}

export function setBackdrop(id: string) {
	backdropId.set(findBackdrop(id).id);
}

export function cyclePalette(step = 1) {
	const index = palettes.findIndex((p) => p.id === get(paletteId));
	setPalette(palettes[(index + step + palettes.length) % palettes.length].id);
}

export function cycleMaterial(step = 1) {
	const index = materialPresets.findIndex((m) => m.id === get(materialId));
	setMaterial(materialPresets[(index + step + materialPresets.length) % materialPresets.length].id);
}

/** Write a palette into the document as CSS custom properties. */
export function applyPalette(palette: Palette) {
	if (!browser) return;
	const root = document.documentElement;
	const v = palette.vars;

	root.style.setProperty('--black', v.base);
	root.style.setProperty('--black-deep', v.baseDeep);
	root.style.setProperty('--white', v.ink);
	root.style.setProperty('--grey-soft', v.inkSoft);
	root.style.setProperty('--grey-faint', v.inkFaint);
	root.style.setProperty('--white-glow', v.glow);
	root.style.setProperty('--surface', v.surface);
	root.style.setProperty('--surface-muted', v.surfaceMuted);
	root.style.setProperty('--border', v.border);
	root.style.setProperty('--border-strong', v.borderStrong);
	root.style.setProperty('--overlay', v.overlay);
	root.style.setProperty('--accent', v.accent);
	root.style.setProperty('--accent-deep', v.accentDeep);
	root.style.setProperty('--shadow-soft', v.shadowSoft);
	root.style.setProperty('--shadow-strong', v.shadowStrong);
	root.style.setProperty('--tile', v.tile);
	root.style.setProperty('--tile-ink', v.tileInk);
	root.style.setProperty('--body-gradient', palette.bodyGradient);
	root.style.setProperty('--texture-image', palette.texture.image);
	root.style.setProperty('--texture-size', palette.texture.size);
	root.style.setProperty('--texture-opacity', String(palette.texture.opacity));
	root.style.setProperty('--texture-blend', palette.texture.blend);
	root.dataset.palette = palette.id;
	root.dataset.scheme = palette.isDark ? 'dark' : 'light';

	// The palette owns the default grain, so re-assert the backdrop over it.
	applyBackdrop(get(activeBackdrop), palette);
}

/** Write a backdrop's two layers into the document. */
export function applyBackdrop(backdrop: Backdrop, palette = get(activePalette)) {
	if (!browser) return;
	const root = document.documentElement;
	const texture = backdrop.usePaletteTexture
		? {
				image: palette.texture.image,
				size: palette.texture.size,
				opacity: palette.texture.opacity,
				blend: palette.texture.blend
			}
		: (backdrop.texture ?? { image: 'none', size: 'auto', opacity: 0, blend: 'normal' });

	root.style.setProperty('--texture-image', texture.image);
	root.style.setProperty('--texture-size', texture.size);
	root.style.setProperty('--texture-opacity', String(texture.opacity));
	root.style.setProperty('--texture-blend', texture.blend);

	const wash = backdrop.wash;
	root.style.setProperty('--wash-image', wash?.image ?? 'none');
	root.style.setProperty('--wash-size', wash?.size ?? 'auto');
	root.style.setProperty('--wash-opacity', String(wash?.opacity ?? 0));
	root.style.setProperty('--wash-blend', wash?.blend ?? 'normal');

	root.dataset.backdrop = backdrop.id;
	if (backdrop.motion) root.dataset.backdropMotion = backdrop.motion;
	else delete root.dataset.backdropMotion;
}

if (browser) {
	activePalette.subscribe(applyPalette);
	activeBackdrop.subscribe((backdrop) => applyBackdrop(backdrop));

	derived([paletteId, materialId, backdropId], ([p, m, b]) => ({
		palette: p,
		material: m,
		backdrop: b
	})).subscribe((state) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch {
			/* private mode — the URL still carries the selection */
		}
	});
}
