import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { palettes, defaultPaletteId, type Palette } from '$lib/theme/palettes';
import { materialPresets, defaultMaterialId, type MaterialPreset } from '$lib/theme/materials';

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

function readInitial() {
	const fallback = { palette: defaultPaletteId, material: defaultMaterialId, lab: false };
	if (!browser) return fallback;

	let stored: { palette?: string; material?: string } = {};
	try {
		stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
	} catch {
		stored = {};
	}

	// URL wins over localStorage so a shared link always shows what it promises.
	const params = new URLSearchParams(window.location.search);
	const paletteParam = params.get('palette') || params.get('theme');
	const materialParam = params.get('material') || params.get('mat');

	return {
		palette: findPalette(paletteParam || stored.palette).id,
		material: findMaterial(materialParam || stored.material).id,
		lab: params.get('lab') === '1' || params.get('lab') === 'true'
	};
}

const initial = readInitial();

export const paletteId = writable<string>(initial.palette);
export const materialId = writable<string>(initial.material);
// Starts closed so the server and the first client render agree; the layout
// opens it from the URL after mount.
export const labOpen = writable<boolean>(false);
export const labRequested = initial.lab;

export const activePalette = derived(paletteId, ($id) => findPalette($id));
export const activeMaterial = derived(materialId, ($id) => findMaterial($id));

export function setPalette(id: string) {
	paletteId.set(findPalette(id).id);
}

export function setMaterial(id: string) {
	materialId.set(findMaterial(id).id);
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
}

if (browser) {
	activePalette.subscribe(applyPalette);

	derived([paletteId, materialId], ([p, m]) => ({ palette: p, material: m })).subscribe((state) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch {
			/* private mode — the URL still carries the selection */
		}
	});
}
