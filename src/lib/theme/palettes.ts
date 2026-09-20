/**
 * Site palettes.
 *
 * A palette owns three things at once so the page and the 3D scene never
 * drift apart: the CSS tokens, the page-grain overlay, and the hero light rig.
 * `applyPalette()` in $lib/stores/themeStore.ts writes the CSS half onto
 * :root; Hero.svelte reads the `scene` half.
 */

export type PaletteVars = {
	/** page base background */
	base: string;
	/** darker edge of the background gradient */
	baseDeep: string;
	/** primary ink */
	ink: string;
	/** secondary ink */
	inkSoft: string;
	/** faint ink wash */
	inkFaint: string;
	/** glow colour */
	glow: string;
	/** raised surface */
	surface: string;
	/** recessed surface */
	surfaceMuted: string;
	border: string;
	borderStrong: string;
	/** scrim over content */
	overlay: string;
	accent: string;
	accentDeep: string;
	/** project-card artwork tile background */
	tile: string;
	/** ink used on top of the artwork tile */
	tileInk: string;
	shadowSoft: string;
	shadowStrong: string;
};

export type PageTexture = {
	name: string;
	image: string;
	size: string;
	opacity: number;
	blend: string;
};

export type SceneRig = {
	ambient: number;
	ambientIntensity: number;
	key: number;
	keyIntensity: number;
	fill: number;
	fillIntensity: number;
	rim: number;
	rimIntensity: number;
	back: number;
	backIntensity: number;
	points: number;
	pointsOpacity: number;
	toneMapping?: 'none' | 'aces' | 'neutral' | 'agx';
	exposure?: number;
};

export type Palette = {
	id: string;
	name: string;
	mood: string;
	isDark: boolean;
	vars: PaletteVars;
	bodyGradient: string;
	texture: PageTexture;
	scene: SceneRig;
	/** the 3D material this palette was tuned against */
	suggestedMaterial: string;
	contrast: string;
};

export const defaultPaletteId = 'parchment-bronze';

export const palettes: Palette[] = [
	{
		id: 'parchment-bronze',
		name: 'Parchment & Bronze',
		mood: 'Aged studio parchment with a struck-bronze accent — warm, quiet, senior.',
		isDark: false,
		vars: {
			base: '#f4e9d6',
			baseDeep: '#e2d0ad',
			ink: '#2f2016',
			inkSoft: '#675140',
			inkFaint: 'rgba(47, 32, 22, 0.06)',
			glow: 'rgba(142, 84, 32, 0.18)',
			surface: '#fffaf0',
			surfaceMuted: '#ead9bb',
			border: 'rgba(47, 32, 22, 0.22)',
			borderStrong: 'rgba(47, 32, 22, 0.46)',
			overlay: 'rgba(244, 233, 214, 0.80)',
			accent: '#8e5420',
			accentDeep: '#5e3210',
			tile: '#1b1610',
			tileInk: 'rgba(255, 250, 240, 0.72)',
			shadowSoft: 'rgba(47, 32, 22, 0.14)',
			shadowStrong: 'rgba(47, 32, 22, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 70% 55% at 22% 34%, rgba(142, 84, 32, 0.1) 0%, rgba(142, 84, 32, 0) 62%), radial-gradient(ellipse 130% 85% at 50% -12%, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Parchment weave & tooth',
			image:
				'repeating-linear-gradient(102deg, rgba(47, 32, 22, 0.035) 0px, rgba(47, 32, 22, 0.035) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(8deg, rgba(47, 32, 22, 0.028) 0px, rgba(47, 32, 22, 0.028) 1px, transparent 1px, transparent 6px), radial-gradient(circle at 21% 34%, rgba(94, 50, 16, 0.05) 0 1px, transparent 1px), radial-gradient(circle at 68% 61%, rgba(47, 32, 22, 0.045) 0 1px, transparent 1px), radial-gradient(circle at 44% 82%, rgba(47, 32, 22, 0.035) 0 1px, transparent 1px)',
			size: '7px 7px, 9px 9px, 17px 17px, 23px 23px, 31px 31px',
			opacity: 0.55,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xfff4e4,
			ambientIntensity: 0.7,
			key: 0xfff0dc,
			keyIntensity: 2.35,
			fill: 0xe8d3b4,
			fillIntensity: 0.62,
			rim: 0xffd9a8,
			rimIntensity: 2.05,
			back: 0xc98d4e,
			backIntensity: 0.95,
			points: 0x2f2016,
			pointsOpacity: 0.07
		},
		suggestedMaterial: 'polished-bronze',
		contrast: 'On the page base: ink 13.0:1, secondary 6.2:1, accent 5.1:1.'
	},
	{
		id: 'ink-bone',
		name: 'Ink & Bone',
		mood: 'Swiss editorial: bone paper, near-black ink, one vermilion signal.',
		isDark: false,
		vars: {
			base: '#efebe3',
			baseDeep: '#dcd6ca',
			ink: '#14110e',
			inkSoft: '#565045',
			inkFaint: 'rgba(20, 17, 14, 0.06)',
			glow: 'rgba(20, 17, 14, 0.13)',
			surface: '#f7f4ee',
			surfaceMuted: '#e4dfd5',
			border: 'rgba(20, 17, 14, 0.15)',
			borderStrong: 'rgba(20, 17, 14, 0.44)',
			overlay: 'rgba(239, 235, 227, 0.80)',
			accent: '#b3301b',
			accentDeep: '#7e2012',
			tile: '#e7e1d6',
			tileInk: 'rgba(20, 17, 14, 0.78)',
			shadowSoft: 'rgba(20, 17, 14, 0.14)',
			shadowStrong: 'rgba(20, 17, 14, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 130% 90% at 50% -12%, var(--surface) 0%, var(--black) 54%, var(--black-deep) 100%)',
		texture: {
			name: 'Letterpress laid paper',
			image:
				'repeating-linear-gradient(90deg, rgba(20, 17, 14, 0.028) 0 1px, transparent 1px 7px), repeating-linear-gradient(0deg, rgba(20, 17, 14, 0.018) 0 1px, transparent 1px 5px), radial-gradient(circle at 22% 34%, rgba(20, 17, 14, 0.06) 0 1px, transparent 1px), radial-gradient(circle at 71% 63%, rgba(20, 17, 14, 0.045) 0 1px, transparent 1px)',
			size: '7px 100%, 100% 5px, 19px 19px, 27px 27px',
			opacity: 0.55,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xf2ece1,
			ambientIntensity: 1,
			key: 0xfffdf6,
			keyIntensity: 2.15,
			fill: 0xdcd5c7,
			fillIntensity: 0.55,
			rim: 0xb3301b,
			rimIntensity: 1.25,
			back: 0xece5d8,
			backIntensity: 0.5,
			points: 0x14110e,
			pointsOpacity: 0.07
		},
		suggestedMaterial: 'matte-clay',
		contrast: 'On the page base: ink 15.8:1, secondary 6.7:1, accent 5.3:1.'
	},
	{
		id: 'obsidian-chrome',
		name: 'Obsidian Chrome',
		mood: 'Near-black theatre, bone type, a cold chrome edge that catches the light.',
		isDark: true,
		vars: {
			base: '#0D0F12',
			baseDeep: '#050608',
			ink: '#F0ECE3',
			inkSoft: '#9AA5B2',
			inkFaint: 'rgba(240, 236, 227, 0.06)',
			glow: 'rgba(157, 180, 204, 0.18)',
			surface: '#1A1E24',
			surfaceMuted: '#08090B',
			border: 'rgba(240, 236, 227, 0.14)',
			borderStrong: 'rgba(240, 236, 227, 0.34)',
			overlay: 'rgba(13, 15, 18, 0.80)',
			accent: '#9DB4CC',
			accentDeep: '#64809E',
			tile: '#111418',
			tileInk: 'rgba(246, 239, 228, 0.72)',
			shadowSoft: 'rgba(240, 236, 227, 0.14)',
			shadowStrong: 'rgba(240, 236, 227, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 120% 70% at 50% -10%, rgba(157, 180, 204, 0.16) 0%, rgba(157, 180, 204, 0) 62%), radial-gradient(ellipse at top, var(--surface) 0%, var(--black) 45%, var(--black-deep) 100%)',
		texture: {
			name: 'Brushed chrome grain',
			image:
				'repeating-linear-gradient(112deg, rgba(200, 216, 232, 0.045) 0 1px, rgba(200, 216, 232, 0) 1px 3px),   radial-gradient(circle at 22% 28%, rgba(196, 214, 233, 0.07) 0 1px, rgba(196, 214, 233, 0) 1px),   radial-gradient(circle at 68% 62%, rgba(157, 180, 204, 0.055) 0 1px, rgba(157, 180, 204, 0) 1px)',
			size: '7px 7px, 19px 19px, 24px 24px',
			opacity: 0.5,
			blend: 'screen'
		},
		scene: {
			ambient: 0x7c8896,
			ambientIntensity: 0.55,
			key: 0xf4f7fb,
			keyIntensity: 3.2,
			fill: 0x4d5f78,
			fillIntensity: 0.85,
			rim: 0xbcd2ea,
			rimIntensity: 3,
			back: 0x9db4cc,
			backIntensity: 1.6,
			points: 0xa8b6c6,
			pointsOpacity: 0.22
		},
		suggestedMaterial: 'liquid-chrome',
		contrast: 'On the page base: ink 16.3:1, secondary 7.7:1, accent 9.0:1.'
	},
	{
		id: 'slate-copper',
		name: 'Slate & Copper',
		mood: 'A cool drafting-room slate warmed by hand-finished copper.',
		isDark: false,
		vars: {
			base: '#dde4ec',
			baseDeep: '#c4cedb',
			ink: '#1d242c',
			inkSoft: '#465260',
			inkFaint: 'rgba(29, 36, 44, 0.07)',
			glow: 'rgba(152, 80, 33, 0.18)',
			surface: '#f0f4f8',
			surfaceMuted: '#ccd5e0',
			border: 'rgba(29, 36, 44, 0.18)',
			borderStrong: 'rgba(29, 36, 44, 0.40)',
			overlay: 'rgba(221, 228, 236, 0.78)',
			accent: '#985021',
			accentDeep: '#6f3916',
			tile: '#0f1319',
			tileInk: 'rgba(240, 244, 248, 0.72)',
			shadowSoft: 'rgba(29, 36, 44, 0.14)',
			shadowStrong: 'rgba(29, 36, 44, 0.26)'
		},
		bodyGradient:
			'linear-gradient(180deg, rgba(152, 80, 33, 0) 58%, rgba(152, 80, 33, 0.06) 100%), radial-gradient(ellipse 130% 85% at 50% -8%, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Drafting grid on cold-press paper',
			image:
				'repeating-linear-gradient(0deg, rgba(29, 36, 44, 0.055) 0 1px, transparent 1px 64px),   repeating-linear-gradient(90deg, rgba(29, 36, 44, 0.055) 0 1px, transparent 1px 64px),   radial-gradient(circle at 28% 36%, rgba(29, 36, 44, 0.05) 0 1px, transparent 1px),   radial-gradient(circle at 74% 66%, rgba(152, 80, 33, 0.045) 0 1px, transparent 1px)',
			size: '64px 64px, 64px 64px, 19px 19px, 27px 27px',
			opacity: 0.45,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xdce4ee,
			ambientIntensity: 0.55,
			key: 0xffe0bd,
			keyIntensity: 2.3,
			fill: 0x93a7bd,
			fillIntensity: 0.8,
			rim: 0xffcf9e,
			rimIntensity: 1.75,
			back: 0x6e8299,
			backIntensity: 0.85,
			points: 0x2b3644,
			pointsOpacity: 0.07
		},
		suggestedMaterial: 'oxidised-patina',
		contrast: 'On the page base: ink 12.2:1, secondary 6.2:1, accent 4.7:1.'
	},
	{
		id: 'nordic-frost',
		name: 'Nordic Frost',
		mood: 'Cold morning light on porcelain — precise, airy, quietly expensive.',
		isDark: false,
		vars: {
			base: '#eef1f6',
			baseDeep: '#cfd8e6',
			ink: '#0d1f3f',
			inkSoft: '#4d5e79',
			inkFaint: 'rgba(13, 31, 63, 0.06)',
			glow: 'rgba(31, 78, 216, 0.15)',
			surface: '#f8fafd',
			surfaceMuted: '#e2e8f1',
			border: 'rgba(13, 31, 63, 0.14)',
			borderStrong: 'rgba(13, 31, 63, 0.34)',
			overlay: 'rgba(238, 241, 246, 0.76)',
			accent: '#1f4ed8',
			accentDeep: '#0f2f9e',
			tile: '#e7edf7',
			tileInk: 'rgba(13, 31, 63, 0.78)',
			shadowSoft: 'rgba(13, 31, 63, 0.14)',
			shadowStrong: 'rgba(13, 31, 63, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse at top, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Frost tooth',
			image:
				'repeating-linear-gradient(135deg, rgba(13, 31, 63, 0.028) 0 1px, transparent 1px 7px),   radial-gradient(circle at 22% 28%, rgba(13, 31, 63, 0.05) 0 1px, transparent 1px),   radial-gradient(circle at 68% 62%, rgba(31, 78, 216, 0.045) 0 1px, transparent 1px)',
			size: '9px 9px, 17px 17px, 22px 22px',
			opacity: 0.2,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xe6edfb,
			ambientIntensity: 0.85,
			key: 0xfcfdff,
			keyIntensity: 2.3,
			fill: 0xccdaf4,
			fillIntensity: 0.7,
			rim: 0x87a9ff,
			rimIntensity: 1.7,
			back: 0x2f5be0,
			backIntensity: 0.85,
			points: 0x1f4ed8,
			pointsOpacity: 0.07
		},
		suggestedMaterial: 'brushed-steel',
		contrast: 'On the page base: ink 14.4:1, secondary 5.8:1, accent 5.9:1.'
	},
	{
		id: 'forest-brass',
		name: 'Forest Brass',
		mood: 'Deep pine-dark study, parchment ink, aged brass fittings.',
		isDark: true,
		vars: {
			base: '#0F1A15',
			baseDeep: '#070E0B',
			ink: '#F2E8D5',
			inkSoft: '#A29C86',
			inkFaint: 'rgba(242, 232, 213, 0.06)',
			glow: 'rgba(199, 164, 78, 0.18)',
			surface: '#17241E',
			surfaceMuted: '#0B1511',
			border: 'rgba(242, 232, 213, 0.14)',
			borderStrong: 'rgba(242, 232, 213, 0.36)',
			overlay: 'rgba(15, 26, 21, 0.78)',
			accent: '#C7A44E',
			accentDeep: '#96732F',
			tile: '#0A120E',
			tileInk: 'rgba(246, 239, 228, 0.72)',
			shadowSoft: 'rgba(242, 232, 213, 0.14)',
			shadowStrong: 'rgba(242, 232, 213, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 130% 85% at 50% -12%, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Brass leaf weave',
			image:
				'repeating-linear-gradient(45deg, rgba(199, 164, 78, 0.035) 0 1px, transparent 1px 4px),   repeating-linear-gradient(-45deg, rgba(242, 232, 213, 0.022) 0 1px, transparent 1px 5px),   radial-gradient(circle at 22% 34%, rgba(199, 164, 78, 0.10) 0 1px, transparent 1.6px),   radial-gradient(circle at 68% 71%, rgba(242, 232, 213, 0.07) 0 1px, transparent 1.6px)',
			size: '6px 6px, 7px 7px, 19px 19px, 27px 27px',
			opacity: 0.55,
			blend: 'screen'
		},
		scene: {
			ambient: 0x24382e,
			ambientIntensity: 0.62,
			key: 0xffeac6,
			keyIntensity: 3.2,
			fill: 0x2f5a46,
			fillIntensity: 0.95,
			rim: 0xd9b25f,
			rimIntensity: 2.9,
			back: 0x1f7a57,
			backIntensity: 1.6,
			points: 0xc7a44e,
			pointsOpacity: 0.22
		},
		suggestedMaterial: 'hammered-brass',
		contrast: 'On the page base: ink 14.7:1, secondary 6.5:1, accent 7.5:1.'
	},
	{
		id: 'concrete-signal',
		name: 'Concrete & Signal',
		mood: 'Poured concrete slab, black ink, one orange signal stripe.',
		isDark: false,
		vars: {
			base: '#c3c4c0',
			baseDeep: '#b9bab6',
			ink: '#121110',
			inkSoft: '#454647',
			inkFaint: 'rgba(18, 17, 16, 0.07)',
			glow: 'rgba(176, 58, 6, 0.22)',
			surface: '#d8d9d5',
			surfaceMuted: '#b7b8b4',
			border: 'rgba(18, 17, 16, 0.22)',
			borderStrong: 'rgba(18, 17, 16, 0.55)',
			overlay: 'rgba(195, 196, 192, 0.78)',
			accent: '#b03a06',
			accentDeep: '#7e2704',
			tile: '#0e0f10',
			tileInk: 'rgba(216, 217, 213, 0.72)',
			shadowSoft: 'rgba(18, 17, 16, 0.14)',
			shadowStrong: 'rgba(18, 17, 16, 0.26)'
		},
		bodyGradient:
			'linear-gradient(176deg, var(--surface) 0%, var(--black) 38%, var(--black) 74%, var(--black-deep) 100%)',
		texture: {
			name: 'Board-formed concrete',
			image:
				'repeating-linear-gradient(90deg, rgba(18, 17, 16, 0.07) 0 1px, rgba(18, 17, 16, 0) 1px 112px), repeating-linear-gradient(0deg, rgba(18, 17, 16, 0.045) 0 1px, rgba(18, 17, 16, 0) 1px 168px), radial-gradient(circle at 21% 34%, rgba(18, 17, 16, 0.11) 0 1.3px, rgba(18, 17, 16, 0) 1.6px), radial-gradient(circle at 68% 72%, rgba(18, 17, 16, 0.08) 0 1px, rgba(18, 17, 16, 0) 1.3px), radial-gradient(circle at 45% 12%, rgba(18, 17, 16, 0.06) 0 0.8px, rgba(18, 17, 16, 0) 1.1px)',
			size: '112px 100%, 100% 168px, 27px 31px, 19px 17px, 13px 11px',
			opacity: 0.5,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xcfd2cd,
			ambientIntensity: 0.62,
			key: 0xfff1e2,
			keyIntensity: 2.9,
			fill: 0x9aa0a6,
			fillIntensity: 0.35,
			rim: 0xff6a12,
			rimIntensity: 1.9,
			back: 0xb03a06,
			backIntensity: 1.1,
			points: 0x1b1c1a,
			pointsOpacity: 0.16
		},
		suggestedMaterial: 'cel-shaded',
		contrast: 'On the page base: ink 10.8:1, secondary 5.4:1, accent 3.5:1.'
	},
	{
		id: 'midnight-teal',
		name: 'Midnight Teal',
		mood: 'Deep-water navy lit by a cold instrument glow — quiet, engineered, awake.',
		isDark: true,
		vars: {
			base: '#0b141d',
			baseDeep: '#060d14',
			ink: '#e9f3f6',
			inkSoft: '#93a9b5',
			inkFaint: 'rgba(233, 243, 246, 0.06)',
			glow: 'rgba(79, 214, 196, 0.22)',
			surface: '#122029',
			surfaceMuted: '#0d1821',
			border: 'rgba(233, 243, 246, 0.14)',
			borderStrong: 'rgba(233, 243, 246, 0.40)',
			overlay: 'rgba(11, 20, 29, 0.78)',
			accent: '#4fd6c4',
			accentDeep: '#1f9d94',
			tile: '#060e15',
			tileInk: 'rgba(246, 239, 228, 0.72)',
			shadowSoft: 'rgba(233, 243, 246, 0.14)',
			shadowStrong: 'rgba(233, 243, 246, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 120% 85% at 50% -10%, rgba(79, 214, 196, 0.10) 0%, rgba(79, 214, 196, 0) 62%), radial-gradient(ellipse at top, var(--surface) 0%, var(--black) 45%, var(--black-deep) 100%)',
		texture: {
			name: 'Sensor grid',
			image:
				'linear-gradient(rgba(122, 226, 212, 0.07) 1px, transparent 1px),   linear-gradient(90deg, rgba(122, 226, 212, 0.06) 1px, transparent 1px),   radial-gradient(circle at 30% 40%, rgba(214, 240, 246, 0.17) 0 1px, transparent 1.4px),   radial-gradient(circle at 75% 65%, rgba(122, 226, 212, 0.14) 0 1px, transparent 1.4px)',
			size: '88px 88px, 88px 88px, 26px 26px, 37px 37px',
			opacity: 0.55,
			blend: 'screen'
		},
		scene: {
			ambient: 0x8fb6c4,
			ambientIntensity: 0.5,
			key: 0xf2fbff,
			keyIntensity: 3.2,
			fill: 0x2b6f82,
			fillIntensity: 0.95,
			rim: 0x6fe8d8,
			rimIntensity: 3,
			back: 0x1e7f8c,
			backIntensity: 2,
			points: 0x4fd6c4,
			pointsOpacity: 0.28
		},
		suggestedMaterial: 'iridescent-pearl',
		contrast: 'On the page base: ink 16.4:1, secondary 7.6:1, accent 10.4:1.'
	},
	{
		id: 'boardroom-navy',
		name: 'Boardroom Navy',
		mood: 'Warm bond paper, deep navy ink, one restrained stroke of antique gold.',
		isDark: false,
		vars: {
			base: '#ece8e1',
			baseDeep: '#d6d0c5',
			ink: '#101d33',
			inkSoft: '#495669',
			inkFaint: 'rgba(16, 29, 51, 0.07)',
			glow: 'rgba(16, 29, 51, 0.13)',
			surface: '#f7f5f0',
			surfaceMuted: '#dfdad1',
			border: 'rgba(16, 29, 51, 0.16)',
			borderStrong: 'rgba(16, 29, 51, 0.34)',
			overlay: 'rgba(236, 232, 225, 0.76)',
			accent: '#7d5f1c',
			accentDeep: '#5c4410',
			tile: '#0b1524',
			tileInk: 'rgba(247, 245, 240, 0.72)',
			shadowSoft: 'rgba(16, 29, 51, 0.14)',
			shadowStrong: 'rgba(16, 29, 51, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 130% 85% at 50% -12%, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Laid bond paper',
			image:
				'repeating-linear-gradient(90deg, rgba(16, 29, 51, 0.055) 0 1px, transparent 1px 4px),   repeating-linear-gradient(0deg, rgba(16, 29, 51, 0.028) 0 1px, transparent 1px 3px),   radial-gradient(circle at 25% 35%, rgba(16, 29, 51, 0.05) 0 1px, transparent 1px),   radial-gradient(circle at 72% 64%, rgba(125, 95, 28, 0.05) 0 1px, transparent 1px)',
			size: '4px 4px, 3px 3px, 19px 19px, 27px 27px',
			opacity: 0.35,
			blend: 'multiply'
		},
		scene: {
			ambient: 0xf2efe8,
			ambientIntensity: 0.62,
			key: 0xfff7e8,
			keyIntensity: 2.6,
			fill: 0xb9c7dc,
			fillIntensity: 0.85,
			rim: 0xd9b45e,
			rimIntensity: 1.85,
			back: 0x2c4568,
			backIntensity: 1.1,
			points: 0x1a2a44,
			pointsOpacity: 0.09
		},
		suggestedMaterial: 'carbon-weave',
		contrast: 'On the page base: ink 13.8:1, secondary 6.1:1, accent 4.9:1.'
	},
	{
		id: 'mono-noir',
		name: 'Mono Noir',
		mood: 'Studio black and silver grain, with one pure-white highlight doing all the shouting.',
		isDark: true,
		vars: {
			base: '#0d0d0d',
			baseDeep: '#030303',
			ink: '#e6e6e6',
			inkSoft: '#a0a0a0',
			inkFaint: 'rgba(255, 255, 255, 0.06)',
			glow: 'rgba(255, 255, 255, 0.18)',
			surface: '#1c1c1c',
			surfaceMuted: '#141414',
			border: 'rgba(255, 255, 255, 0.14)',
			borderStrong: 'rgba(255, 255, 255, 0.34)',
			overlay: 'rgba(13, 13, 13, 0.72)',
			accent: '#ffffff',
			accentDeep: '#b5b5b5',
			tile: '#151515',
			tileInk: 'rgba(246, 239, 228, 0.72)',
			shadowSoft: 'rgba(230, 230, 230, 0.14)',
			shadowStrong: 'rgba(230, 230, 230, 0.26)'
		},
		bodyGradient:
			'radial-gradient(ellipse 120% 85% at 50% -8%, var(--surface) 0%, var(--black) 46%, var(--black-deep) 100%)',
		texture: {
			name: 'Silver halide grain',
			image:
				'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'180\' height=\'180\'%3E%3Cfilter id=\'g\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'180\' height=\'180\' filter=\'url(%23g)\'/%3E%3C/svg%3E")',
			size: '180px 180px',
			opacity: 0.11,
			blend: 'screen'
		},
		scene: {
			ambient: 0xffffff,
			ambientIntensity: 0.32,
			key: 0xffffff,
			keyIntensity: 3.4,
			fill: 0xd8d8d8,
			fillIntensity: 0.55,
			rim: 0xffffff,
			rimIntensity: 3.2,
			back: 0xf0f0f0,
			backIntensity: 1.6,
			points: 0xffffff,
			pointsOpacity: 0.14
		},
		suggestedMaterial: 'velvet-sheen',
		contrast: 'On the page base: ink 15.6:1, secondary 7.4:1, accent 19.4:1.'
	}
];
