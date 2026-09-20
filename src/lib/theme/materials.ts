/**
 * 3D material presets for the hero models.
 *
 * Each preset builds a fresh three.js material per mesh, so a preset can tint
 * itself from the active palette and can treat the head differently from the
 * four small logos (they are tiny on screen and need punchier values).
 *
 * Textures are painted procedurally at runtime — see ./textures.ts — so
 * nothing here needs an image asset. Every parameter used below exists in the
 * pinned three release (r179); anything that is a Vector2/Color instance is set
 * in `setup()` rather than passed to the constructor, because Material.setValues
 * would replace the instance with a plain object.
 */
import type { Palette } from './palettes';
import {
	canvasTexture,
	toonRamp,
	grain,
	brushed,
	hammered,
	weave,
	veined,
	patina,
	patinaMask,
	clouds
} from './textures';

export type MaterialContext = {
	THREE: any;
	palette: Palette;
	/** true for the head mesh, false for the floating logo meshes */
	isHead: boolean;
	isMobile: boolean;
	mesh?: any;
	scene?: any;
	/** register an object the preset added so it can be removed on switch */
	addExtra: (object: any) => void;
};

export type MaterialPreset = {
	id: string;
	name: string;
	family: 'metal' | 'ceramic' | 'glass' | 'stone' | 'fabric' | 'stylised';
	look: string;
	risks?: string;
	build(context: MaterialContext): any;
	setup?(context: MaterialContext & { material: any }): void;
};

export const defaultMaterialId = 'polished-bronze';

/** Pick between a head value and a logo value. */
const pick = <T>(isHead: boolean, head: T, logo: T) => (isHead ? head : logo);

export const materialPresets: MaterialPreset[] = [
	/* ---------------------------------------------------------------- metal */
	{
		id: 'polished-bronze',
		name: 'Polished bronze',
		family: 'metal',
		look: 'Cast bronze under a thin lacquer: one long soft highlight down the cheek with a tighter clearcoat glint on top.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xb17838, 0xc9944e),
				metalness: 1,
				roughness: pick(isHead, 0.23, 0.17),
				clearcoat: pick(isHead, 0.45, 0.35),
				clearcoatRoughness: pick(isHead, 0.08, 0.06),
				envMapIntensity: pick(isHead, 1.15, 1.35),
				roughnessMap: canvasTexture(THREE, 'bronze-polish', clouds, {
					size: 256,
					repeat: 3,
					levels: [0.8, 1]
				})
			});
		}
	},
	{
		id: 'liquid-chrome',
		name: 'Liquid chrome',
		family: 'metal',
		look: 'A mirror: the room slides across the form as it floats, with a faint petrol shimmer where the silhouette turns away.',
		risks:
			'Mirror metal shows whatever the HDR shows — it picks up very little of the page palette.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xc2c8d0, 0xdfe4ea),
				metalness: 1,
				roughness: pick(isHead, 0.02, 0.06),
				clearcoat: 1,
				clearcoatRoughness: pick(isHead, 0.04, 0.08),
				iridescence: pick(isHead, 0.18, 0.1),
				iridescenceIOR: 1.25,
				iridescenceThicknessRange: pick(isHead, [140, 420], [180, 520]),
				envMapIntensity: pick(isHead, 1.7, 2.05),
				normalMap: canvasTexture(THREE, 'chrome-swell', hammered, {
					size: 512,
					repeat: 2,
					asNormal: true,
					strength: 0.5
				})
			});
		},
		setup({ material, isHead }) {
			material.normalScale.set(...(isHead ? [0.18, 0.18] : [0.1, 0.1]));
		}
	},
	{
		id: 'brushed-steel',
		name: 'Brushed steel',
		family: 'metal',
		look: 'Satin stainless with a directional grain — the highlight smears along the brush lines instead of pooling.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xb7bcc3, 0xcdd2d8),
				metalness: 1,
				roughness: pick(isHead, 0.58, 0.48),
				anisotropy: 0.9,
				anisotropyRotation: 0,
				envMapIntensity: pick(isHead, 0.9, 1.1),
				roughnessMap: canvasTexture(THREE, 'steel-brush-rough', brushed, {
					size: 512,
					repeat: 8,
					levels: [0.7, 1]
				}),
				normalMap: canvasTexture(THREE, 'steel-brush-normal', brushed, {
					size: 512,
					repeat: 8,
					asNormal: true,
					strength: 2.2
				})
			});
		},
		setup({ material }) {
			material.normalScale.set(0.55, 0.55);
		}
	},
	{
		id: 'hammered-brass',
		name: 'Hammered brass',
		family: 'metal',
		look: 'Planished by hand: every dimple catches its own small highlight, so the form reads as a field of sparks.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xc9a04a, 0xd9b45e),
				metalness: 1,
				roughness: pick(isHead, 0.3, 0.24),
				clearcoat: 0.25,
				clearcoatRoughness: 0.2,
				envMapIntensity: pick(isHead, 1.3, 1.5),
				normalMap: canvasTexture(THREE, 'brass-hammer', hammered, {
					size: 512,
					repeat: pick(isHead, 3, 2),
					asNormal: true,
					strength: 2.6
				})
			});
		},
		setup({ material, isHead }) {
			material.normalScale.set(...(isHead ? [0.85, 0.85] : [0.55, 0.55]));
		}
	},
	{
		id: 'oxidised-patina',
		name: 'Oxidised copper',
		family: 'metal',
		look: 'Bare copper going green: verdigris blooms sit matte against the polished metal still showing through.',
		build({ THREE, isHead }) {
			const colour = patina('#b4703c', 'rgba(86, 150, 128, 0.85)', 'rgba(118, 166, 138, 0.7)');
			// White = bare copper (metal, glossy), black = oxide (matte, non-metal).
			const bare = patinaMask();
			const repeat = pick(isHead, 3, 2);
			return new THREE.MeshPhysicalMaterial({
				color: 0xffffff,
				metalness: 1,
				roughness: 1,
				envMapIntensity: pick(isHead, 1.05, 1.25),
				map: canvasTexture(THREE, 'copper-patina', colour, { size: 512, repeat, srgb: true }),
				metalnessMap: canvasTexture(THREE, 'copper-bare', bare, { size: 512, repeat }),
				roughnessMap: canvasTexture(THREE, 'copper-bare-inv', patinaMask('#38383a', '#e6e6e6'), {
					size: 512,
					repeat
				}),
				normalMap: canvasTexture(THREE, 'copper-relief', bare, {
					size: 512,
					repeat,
					asNormal: true,
					strength: 1.2
				})
			});
		},
		setup({ material }) {
			material.normalScale.set(0.5, 0.5);
		}
	},

	/* -------------------------------------------------------------- ceramic */
	{
		id: 'matte-clay',
		name: 'Unglazed clay',
		family: 'ceramic',
		look: 'Fired terracotta left unglazed: no highlight to speak of, light falling off in broad soft forms over a sandy tooth.',
		build({ THREE, isHead, palette }) {
			const earth = new THREE.Color(palette.isDark ? '#c2704a' : '#9e5b3c');
			return new THREE.MeshPhysicalMaterial({
				color: earth,
				metalness: 0,
				roughness: pick(isHead, 1, 0.95),
				ior: 1.45,
				specularIntensity: pick(isHead, 0.22, 0.4),
				sheen: pick(isHead, 0.3, 0),
				sheenRoughness: 1,
				envMapIntensity: pick(isHead, 0.85, 1.05),
				normalMap: canvasTexture(THREE, 'clay-grain', grain, {
					size: 512,
					repeat: 5,
					asNormal: true,
					strength: 1.6
				}),
				roughnessMap: canvasTexture(THREE, 'clay-rough', grain, {
					size: 512,
					repeat: 5,
					levels: [0.9, 1]
				})
			});
		},
		setup({ THREE, material, isHead }) {
			material.normalScale.set(0.6, 0.6);
			if (isHead) material.sheenColor = new THREE.Color(0xcfa583);
			material.specularColor = new THREE.Color(0xd8c2ad);
		}
	},
	{
		id: 'glazed-porcelain',
		name: 'Glazed porcelain',
		family: 'ceramic',
		look: 'A museum object: bone-white body under one wet glaze, with hairline crazing catching the light across it.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xdcd2c4, 0xc7ad86),
				metalness: 0,
				roughness: pick(isHead, 0.52, 0.4),
				clearcoat: 1,
				clearcoatRoughness: pick(isHead, 0.06, 0.04),
				sheen: pick(isHead, 0.25, 0.32),
				sheenRoughness: pick(isHead, 0.85, 0.7),
				ior: pick(isHead, 1.5, 1.55),
				specularIntensity: 1,
				envMapIntensity: pick(isHead, 1.05, 1.5),
				normalMap: canvasTexture(THREE, 'porcelain-craze', veined('#808080', '#d8d8d8'), {
					size: 512,
					repeat: 3,
					asNormal: true,
					strength: 1
				})
			});
		},
		setup({ THREE, material }) {
			material.normalScale.set(0.32, 0.32);
			material.sheenColor = new THREE.Color(0xe8dcc8);
			material.specularColor = new THREE.Color(0xffffff);
		}
	},
	{
		id: 'iridescent-pearl',
		name: 'Iridescent pearl',
		family: 'ceramic',
		look: 'Thin-film shimmer over a dark shell: the hue walks from violet to green as the form turns. Oil on water.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0x17161d, 0x211f2a),
				metalness: pick(isHead, 0.55, 0.65),
				roughness: pick(isHead, 0.17, 0.12),
				iridescence: 1,
				iridescenceIOR: 1.9,
				iridescenceThicknessRange: pick(isHead, [180, 760], [220, 900]),
				clearcoat: 1,
				clearcoatRoughness: 0.08,
				envMapIntensity: pick(isHead, 1.3, 1.6),
				iridescenceThicknessMap: canvasTexture(THREE, 'pearl-film', clouds, {
					size: 512,
					repeat: 2
				})
			});
		}
	},

	/* ---------------------------------------------------------------- glass */
	{
		id: 'frosted-glass',
		name: 'Frosted glass',
		family: 'glass',
		look: 'Satin-frosted casting: the page shows through as a soft bloom, the silhouette held by the frosted edge.',
		risks:
			'Costs an extra render pass per frame. The canvas is transparent, so the head refracts the scene, not the page behind it — it frosts rather than magnifies.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xf4ead9, 0xe9d4b6),
				metalness: 0,
				roughness: pick(isHead, 0.42, 0.32),
				transmission: pick(isHead, 0.68, 0.55),
				thickness: pick(isHead, 0.32, 1),
				ior: pick(isHead, 1.46, 1.5),
				attenuationDistance: pick(isHead, 0.9, 0.35),
				clearcoat: pick(isHead, 0.55, 0.85),
				clearcoatRoughness: pick(isHead, 0.24, 0.14),
				specularIntensity: 1,
				sheen: pick(isHead, 0.22, 0),
				sheenRoughness: 0.65,
				envMapIntensity: pick(isHead, 1.25, 1.55),
				normalMap: canvasTexture(THREE, 'frost-grain', grain, {
					size: 512,
					repeat: 4,
					asNormal: true,
					strength: 1.2
				})
			});
		},
		setup({ THREE, material, isHead, palette }) {
			material.normalScale.set(0.4, 0.4);
			material.attenuationColor = new THREE.Color(palette.isDark ? '#7fa8c8' : '#c08a52');
			if (isHead) material.sheenColor = new THREE.Color(0xffe9cf);
			material.specularColor = new THREE.Color(0xfff4e4);
		}
	},
	{
		id: 'crystal-clear',
		name: 'Cut crystal',
		family: 'glass',
		look: 'Optical glass: the page bends through the form, with prismatic fringing along every curve.',
		risks:
			'The heaviest option (transmission + dispersion). Same caveat as frosted glass: there is no page content behind the canvas for it to refract.',
		build({ THREE, isHead }) {
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0xffffff, 0xeaf4ff),
				metalness: 0,
				roughness: 0.02,
				transmission: pick(isHead, 1, 0.82),
				thickness: pick(isHead, 1.1, 0.14),
				ior: 1.6,
				dispersion: pick(isHead, 2.2, 3.2),
				iridescence: pick(isHead, 0.3, 0.6),
				iridescenceIOR: pick(isHead, 1.42, 1.45),
				iridescenceThicknessRange: pick(isHead, [120, 520], [160, 640]),
				clearcoat: 1,
				clearcoatRoughness: pick(isHead, 0.03, 0.02),
				specularIntensity: 1,
				attenuationDistance: pick(isHead, 1.6, 0.45),
				envMapIntensity: pick(isHead, 1.6, 2.4)
			});
		},
		setup({ THREE, material, isHead }) {
			material.attenuationColor = new THREE.Color(isHead ? '#bcd6e6' : '#8fbcd8');
			material.specularColor = new THREE.Color(0xffffff);
		}
	},

	/* ---------------------------------------------------------------- stone */
	{
		id: 'veined-marble',
		name: 'Veined marble',
		family: 'stone',
		look: 'A classical bust: cool stone with grey veins running through it and a faint polish on the high forms.',
		build({ THREE, isHead, palette }) {
			const stone = palette.isDark ? '#dcd7cd' : '#e8e2d8';
			const vein = palette.isDark ? '#4a4844' : '#575450';
			const painter = veined(stone, vein);
			return new THREE.MeshPhysicalMaterial({
				color: 0xffffff,
				metalness: 0,
				roughness: pick(isHead, 0.3, 0.25),
				clearcoat: 0.55,
				clearcoatRoughness: 0.22,
				ior: 1.48,
				envMapIntensity: pick(isHead, 0.9, 1.1),
				map: canvasTexture(THREE, `marble-${stone}`, painter, { size: 512, repeat: 2, srgb: true }),
				roughnessMap: canvasTexture(THREE, `marble-rough-${stone}`, painter, {
					size: 512,
					repeat: 2,
					levels: [0.75, 1]
				})
			});
		}
	},
	{
		id: 'carbon-weave',
		name: 'Carbon weave',
		family: 'stone',
		look: 'Technical composite: a tight over-under weave under gloss, dark and matte-of-fact.',
		build({ THREE, isHead }) {
			const painter = weave;
			return new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0x2a2d33, 0x3a3e46),
				metalness: 0.65,
				roughness: 0.35,
				clearcoat: 0.9,
				clearcoatRoughness: 0.12,
				envMapIntensity: pick(isHead, 1.15, 1.35),
				normalMap: canvasTexture(THREE, 'carbon-weave', painter, {
					size: 512,
					repeat: pick(isHead, 10, 6),
					asNormal: true,
					strength: 1.8
				}),
				roughnessMap: canvasTexture(THREE, 'carbon-weave-rough', painter, {
					size: 512,
					repeat: pick(isHead, 10, 6),
					levels: [0.7, 1]
				})
			});
		},
		setup({ material }) {
			material.normalScale.set(0.55, 0.55);
		}
	},

	/* --------------------------------------------------------------- fabric */
	{
		id: 'velvet-sheen',
		name: 'Velvet',
		family: 'fabric',
		look: 'Light-drinking flock: the form goes almost black in the middle and lights up along every turning edge.',
		build({ THREE, isHead, palette }) {
			const material = new THREE.MeshPhysicalMaterial({
				color: pick(isHead, 0x15151c, 0x1d1d26),
				metalness: 0,
				roughness: 1,
				sheen: 1,
				sheenRoughness: pick(isHead, 0.32, 0.26),
				envMapIntensity: pick(isHead, 0.5, 0.7),
				normalMap: canvasTexture(THREE, 'velvet-nap', grain, {
					size: 512,
					repeat: 8,
					asNormal: true,
					strength: 0.8
				})
			});
			material.sheenColor = new THREE.Color(palette.vars.accent);
			return material;
		},
		setup({ material }) {
			material.normalScale.set(0.25, 0.25);
		}
	},

	/* ------------------------------------------------------------- stylised */
	{
		id: 'cel-shaded',
		name: 'Cel shaded',
		family: 'stylised',
		look: 'Graphic-novel treatment: three flat bands of tone and a drawn ink outline around the silhouette.',
		build({ THREE, isHead, palette }) {
			const accent = new THREE.Color(palette.vars.accent);
			// Four flat bands. The hue comes from `color`; the ramp is the tone.
			return new THREE.MeshToonMaterial({
				color: isHead ? accent : accent.clone().offsetHSL(0, -0.05, 0.12),
				gradientMap: toonRamp(THREE, 'cel-4band', ['#3a3a3a', '#7d7d7d', '#c4c4c4', '#ffffff'])
			});
		},
		setup({ THREE, material, mesh, palette, addExtra, isHead }) {
			// Inverted-hull outline: a back-facing copy scaled up a touch.
			const outline = new THREE.Mesh(
				mesh.geometry,
				new THREE.MeshBasicMaterial({
					color: new THREE.Color(palette.vars.ink),
					side: THREE.BackSide
				})
			);
			outline.scale.setScalar(isHead ? 1.035 : 1.06);
			outline.userData.presetExtra = true;
			mesh.add(outline);
			addExtra(outline);
		}
	},
	{
		id: 'wireframe-blueprint',
		name: 'Blueprint wire',
		family: 'stylised',
		look: 'Engineering drawing: the mesh as drawn wire over a solid fill, so only the front lattice reads.',
		build({ THREE, isHead, palette }) {
			return new THREE.MeshBasicMaterial({
				color: new THREE.Color(palette.vars.accent),
				wireframe: true,
				transparent: true,
				opacity: pick(isHead, 0.7, 0.9)
			});
		},
		setup({ THREE, material, mesh, palette, addExtra }) {
			// A solid shell just inside the wires hides the back of the lattice.
			const shell = new THREE.Mesh(
				mesh.geometry,
				new THREE.MeshBasicMaterial({
					color: new THREE.Color(palette.vars.base),
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				})
			);
			shell.scale.setScalar(0.996);
			shell.userData.presetExtra = true;
			mesh.add(shell);
			addExtra(shell);
		}
	}
];
