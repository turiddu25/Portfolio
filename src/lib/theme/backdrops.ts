/**
 * Page backdrops.
 *
 * A backdrop is what sits behind the content across the whole site: a fine
 * texture layer (`body::before`) and a large soft wash layer (`body::after`).
 *
 * Every value here is written in terms of the palette's own tokens — `--white`
 * is the ink, `--accent` the accent — via `color-mix()`, so one backdrop works
 * on all ten palettes without a per-palette variant. Nothing here is an image.
 */

export type BackdropLayer = {
	image: string;
	size: string;
	opacity: number;
	blend: string;
};

export type Backdrop = {
	id: string;
	name: string;
	note: string;
	/** Keep whatever grain the active palette defines for itself. */
	usePaletteTexture?: boolean;
	texture?: BackdropLayer;
	wash?: BackdropLayer;
	/** Slow ambient movement. Suppressed under prefers-reduced-motion. */
	motion?: 'drift';
};

const ink = (pct: number) => `color-mix(in srgb, var(--white) ${pct}%, transparent)`;
const accent = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

export const defaultBackdropId = 'palette-grain';

export const backdrops: Backdrop[] = [
	{
		id: 'palette-grain',
		name: 'Palette grain',
		note: 'The paper texture each palette brings with it. Static, quiet, current behaviour.',
		usePaletteTexture: true
	},
	{
		id: 'ambient-drift',
		name: 'Ambient drift',
		note: 'Three soft washes of accent and ink that drift over about a minute — the page feels lit rather than filled.',
		usePaletteTexture: true,
		motion: 'drift',
		wash: {
			image: `radial-gradient(38rem 30rem at 18% 22%, ${accent(16)} 0%, transparent 70%),
				radial-gradient(44rem 34rem at 82% 30%, ${ink(9)} 0%, transparent 72%),
				radial-gradient(52rem 38rem at 50% 96%, ${accent(10)} 0%, transparent 74%)`,
			size: '140% 140%, 150% 150%, 160% 160%',
			opacity: 1,
			blend: 'normal'
		}
	},
	{
		id: 'blueprint-grid',
		name: 'Blueprint grid',
		note: 'A drafting grid: a fine 28px weave with a heavier rule every fifth line. Reads as engineering, not decoration.',
		texture: {
			image: `linear-gradient(${ink(9)} 1px, transparent 1px),
				linear-gradient(90deg, ${ink(9)} 1px, transparent 1px),
				linear-gradient(${ink(16)} 1px, transparent 1px),
				linear-gradient(90deg, ${ink(16)} 1px, transparent 1px)`,
			size: '28px 28px, 28px 28px, 140px 140px, 140px 140px',
			opacity: 0.55,
			blend: 'normal'
		},
		wash: {
			image: `radial-gradient(60rem 44rem at 50% 0%, ${accent(9)} 0%, transparent 70%)`,
			size: '100% 100%',
			opacity: 1,
			blend: 'normal'
		}
	},
	{
		id: 'contour-rings',
		name: 'Contour rings',
		note: 'Topographic rings spreading from behind the head. Suits the palettes that lean scientific.',
		texture: {
			image: `repeating-radial-gradient(circle at 34% 34%, transparent 0 46px, ${ink(11)} 46px 47px)`,
			size: '100% 100%',
			opacity: 0.8,
			blend: 'normal'
		},
		wash: {
			image: `radial-gradient(46rem 46rem at 34% 34%, ${accent(13)} 0%, transparent 68%)`,
			size: '100% 100%',
			opacity: 1,
			blend: 'normal'
		}
	},
	{
		id: 'halftone-fade',
		name: 'Halftone fade',
		note: 'A print halftone that coarsens down the page — the dots get bigger as you scroll into the work.',
		texture: {
			image: `radial-gradient(${ink(20)} 1px, transparent 1.4px),
				radial-gradient(${ink(12)} 1.6px, transparent 2.2px)`,
			size: '14px 14px, 34px 34px',
			opacity: 0.5,
			blend: 'normal'
		},
		wash: {
			image: `linear-gradient(180deg, transparent 0%, ${accent(8)} 100%)`,
			size: '100% 100%',
			opacity: 1,
			blend: 'normal'
		}
	},
	{
		id: 'horizon-glow',
		name: 'Horizon glow',
		note: 'One wide band of accent light low on the page, like a studio sweep behind the model. Nothing else.',
		wash: {
			image: `radial-gradient(90rem 30rem at 50% 108%, ${accent(22)} 0%, transparent 70%),
				radial-gradient(50rem 26rem at 50% -8%, ${ink(7)} 0%, transparent 72%)`,
			size: '100% 100%, 100% 100%',
			opacity: 1,
			blend: 'normal'
		}
	},
	{
		id: 'bare',
		name: 'Bare',
		note: 'No texture at all — just the palette gradient. The most severe option, and the fastest.',
		texture: { image: 'none', size: 'auto', opacity: 0, blend: 'normal' }
	}
];
