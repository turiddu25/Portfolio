<!-- @ts-nocheck -->

<script>
	// @ts-nocheck
	import { onMount, tick } from 'svelte';
	import { gsap } from 'gsap';
	import { openChat } from '$lib/stores/chatStore';
	import { sceneReady as sceneReadyStore } from '$lib/stores/sceneStore';
	import { activeMaterial, activePalette } from '$lib/stores/themeStore';

	let heroSection;
	let canvas;
	let THREE;
	let scene, camera, renderer, head;
	let raycaster, pointer;
	let headLoaded = false;
	let headHovered = false;
	let logos = [];
	let headGroup;
	let headFloatOffset = 0;
	let isSceneReady = false;

	// --- theme wiring -------------------------------------------------
	// The palette drives the light rig and background motes; the material
	// preset drives what the head and logos are *made of*. Both can change
	// at runtime (see $lib/theme and the theme lab panel).
	let lights = {};
	let backgroundPoints;
	let currentPalette;
	let currentMaterial;
	let managedMaterials = [];
	let presetExtras = [];
	let unsubscribers = [];

	const LOGO_FLOAT_AMOUNT = 0.1;

	// ===== HEAD POSITIONING CONFIG =====
	// Customize these values for desktop and mobile!
	const HEAD_POSITIONS = {
		desktop: { x: -1, y: 0 },
		mobile: { x: 0, y: 0.4 } // Mobile head position (customize this!)
	};
	// ===================================

	// ===== HEAD & LOGO SCALE CONFIG =====
	// Customize scale (size) for desktop and mobile!
	const HEAD_SCALE = {
		desktop: 3.6 * 0.7, // Desktop head size
		mobile: 2.2 * 0.7 // Mobile head size (customize this!)
	};

	const LOGO_SCALE_MULTIPLIER = {
		desktop: 1.0, // Desktop logo size (1.0 = normal)
		mobile: 0.7 // Mobile logo size multiplier (customize this!)
	};
	// ====================================

	// ===== ANIMATION CONFIG =====
	// Customize animation distances and timing!
	const ANIMATION_CONFIG = {
		head: {
			startX: 0, // X offset from final position (0 = no offset, + = right, - = left)
			startY: 4, // Y offset from final position (0 = no offset, + = up, - = down)
			startZ: -4, // How far back head starts (negative = further away)
			startScale: 0.5, // Starting scale multiplier (0.5 = half size)
			duration: 1.8, // Animation duration in seconds
			delay: 0.6 // Delay before animation starts
		}
	};

	// Default animation settings for logos (can be overridden per logo)
	const DEFAULT_LOGO_ANIMATION = {
		startX: 0,
		startY: -4,
		startZ: -15,
		startScale: 0.3,
		duration: 2.0,
		delay: 0.8
	};
	// ===========================

	function getResponsiveScale() {
		const width = window.innerWidth;
		if (width < 768) return HEAD_SCALE.mobile;
		return HEAD_SCALE.desktop;
	}

	function getLogoScaleMultiplier() {
		const width = window.innerWidth;
		if (width < 768) return LOGO_SCALE_MULTIPLIER.mobile;
		return LOGO_SCALE_MULTIPLIER.desktop;
	}

	function getResponsivePosition() {
		const width = window.innerWidth;
		if (width < 768) return HEAD_POSITIONS.mobile;
		return HEAD_POSITIONS.desktop;
	}

	let paused = false;
	let rafId = 0;
	let rendered = { width: 0, height: 0 };

	// The "talk to me" label tracks the head's projected screen position, so it
	// stays pinned under the chin as the head floats and at any viewport size.
	let headHint;
	let hintProjection;
	let hintVisible = false;
	const HINT_SEEN_KEY = 'colin-chat-opened';

	// Pointer-follow for the head: a target set on move, eased every frame.
	const pointerTarget = { x: 0, y: 0 };
	const pointerEased = { x: 0, y: 0 };
	const LOOK_AMOUNT = { x: 0.26, y: 0.14 };

	function handleVisibilityChange() {
		const wasPaused = paused;
		paused = document.hidden;
		// Only restart the loop if it had actually stopped, otherwise a quick
		// tab-out/tab-in leaves two loops rendering every frame.
		if (wasPaused && !paused && isSceneReady) animate();
	}

	// NB: onMount only honours a returned cleanup when the callback is
	// synchronous — an async callback returns a promise and the teardown is
	// dropped. The setup is async, so it runs inside a synchronous callback.
	onMount(() => {
		let destroyed = false;
		sceneReadyStore.set(false);

		(async () => {
			const threeModule = await import('three');
			const [{ GLTFLoader }, { RGBELoader }, { DRACOLoader }] = await Promise.all([
				import('three/addons/loaders/GLTFLoader.js'),
				import('three/addons/loaders/RGBELoader.js'),
				import('three/addons/loaders/DRACOLoader.js')
			]);

			if (destroyed) return;
			THREE = threeModule;

			// Subscribe before the scene exists: both handlers are guarded, and this
			// way the first palette/material are in hand by the time models land.
			unsubscribers.push(
				activePalette.subscribe((palette) => applyScenePalette(palette)),
				activeMaterial.subscribe((preset) => applyMaterialPreset(preset))
			);

			initScene(GLTFLoader, RGBELoader, DRACOLoader);
			window.addEventListener('resize', onResize);
			window.addEventListener('scroll', handleScroll);
			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('click', handleClick);
			document.addEventListener('visibilitychange', handleVisibilityChange);
		})();

		return () => {
			destroyed = true;
			paused = true;
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('click', handleClick);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			clearTimeout(loadingTimeout);
			unsubscribers.forEach((unsubscribe) => unsubscribe());
			unsubscribers = [];
			clearPresetExtras();
			disposeManagedMaterials();
			if (renderer) renderer.dispose();
		};
	});

	function scrollToProjects() {
		const projectsSection = document.querySelector('#projects');
		if (projectsSection && window.lenis) {
			window.lenis.scrollTo(projectsSection, { duration: 2 });
		} else if (projectsSection) {
			projectsSection.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function warmUpRenderer() {
		for (let i = 0; i < 10; i++) {
			renderer.render(scene, camera);
		}
	}

	let loadingTimeout;

	function markSceneReady() {
		if (isSceneReady) return; // prevent double-fire from timeout + onLoad race
		clearTimeout(loadingTimeout);
		warmUpRenderer();
		isSceneReady = true;
		sceneReadyStore.set(true);
		startHeroReveal();
		animate();
	}

	function initScene(GLTFLoader, RGBELoader, DRACOLoader) {
		const manager = new THREE.LoadingManager();
		manager.onLoad = markSceneReady;
		manager.onError = (url) => {
			console.error('Failed to load:', url);
			markSceneReady(); // show page anyway on asset failure
		};

		const gltfLoader = new GLTFLoader(manager);
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
		gltfLoader.setDRACOLoader(dracoLoader);
		const rgbeLoader = new RGBELoader(manager);
		raycaster = new THREE.Raycaster();
		pointer = new THREE.Vector2();

		scene = new THREE.Scene();
		const size = canvasSize();
		camera = new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
		camera.position.z = 5;
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		// `false`: CSS already sizes the canvas, we only set the drawing buffer.
		renderer.setSize(size.width, size.height, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, size.width < 768 ? 1.5 : 2));
		rendered = size;

		rgbeLoader.load(
			'/studio_small_03_1k.hdr',
			(texture) => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.environment = texture;
			},
			undefined,
			(error) => console.error('Error loading HDR:', error)
		);

		lights.ambient = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(lights.ambient);
		lights.key = new THREE.DirectionalLight(0xffffff, 2.5);
		lights.key.position.set(5, 5, 5);
		scene.add(lights.key);
		lights.fill = new THREE.DirectionalLight(0xffffff, 0.6);
		lights.fill.position.set(-5, 0, -5);
		scene.add(lights.fill);
		lights.rim = new THREE.DirectionalLight(0xffffff, 2.0);
		lights.rim.position.set(0, 5, -5);
		scene.add(lights.rim);
		lights.back = new THREE.PointLight(0xffffff, 1.0);
		lights.back.position.set(0, 0, -3);
		scene.add(lights.back);

		// A palette may already be selected before the scene existed.
		applyScenePalette(currentPalette);

		gltfLoader.load(
			'/head33.glb',
			(gltf) => {
				head = gltf.scene;
				dressObject(head, true);

				headGroup = new THREE.Group();
				const pos = getResponsivePosition();
				headGroup.position.set(pos.x, pos.y, 0);
				head.scale.set(getResponsiveScale(), getResponsiveScale(), getResponsiveScale());
				head.rotation.set(0, Math.PI, 0);
				headGroup.add(head);
				scene.add(headGroup);
				headLoaded = true;
				loadLogos(gltfLoader);
			},
			undefined,
			(error) => console.error('Error loading head:', error)
		);

		addBackgroundGrid();

		// Fallback: show page after 10s even if assets haven't finished
		loadingTimeout = setTimeout(() => {
			if (!isSceneReady) {
				console.warn('Scene loading timed out after 10 seconds');
				markSceneReady();
			}
		}, 10000);
	}

	function loadLogos(loader) {
		// Desktop positions + Individual animation settings
		const logoFiles = [
			{
				file: '/c.glb',
				scale: 0.01,
				x: 1.3,
				y: 1.3,
				z: 0,
				rotationY: -Math.PI / 6,
				// Mobile positions
				mobileX: 0.5,
				mobileY: 1.1,
				mobileZ: 0,
				// Animation settings (optional - uses defaults if not specified)
				animation: {
					startX: 3, // Come from right
					startY: 10,
					startZ: -15,
					startScale: 0.3,
					duration: 2.0,
					delay: 0.8
				}
			},
			{
				file: '/java.glb',
				scale: 0.2,
				x: -1.1,
				y: 1.1,
				z: 0.8,
				mobileX: -0.6,
				mobileY: 0.9,
				mobileZ: 0.5,
				animation: {
					startX: -10,
					startY: 10,
					startZ: -18,
					delay: 1.1
				}
			},
			{
				file: '/python.glb',
				scale: 0.01,
				x: -1.4,
				y: 0,
				z: 0,
				mobileX: -0.8,
				mobileY: 0,
				mobileZ: 0,
				animation: {
					startX: -10,
					startY: -10,
					startZ: -12,
					delay: 1.2
				}
			},
			{
				file: '/react_logo.glb',
				scale: 0.15,
				x: 1.1,
				y: -1.0,
				z: 0.8,
				mobileX: 0.7,
				mobileY: -0.3,
				mobileZ: 0.5,
				animation: {
					startX: 3,
					startY: -10,
					startZ: -14,
					delay: 1.3
				}
			}
		];

		logoFiles.forEach((data, index) => {
			loader.load(
				data.file,
				(gltf) => {
					const logo = gltf.scene;
					dressObject(logo, false);

					const scaleMultiplier = getLogoScaleMultiplier();
					const finalScale = data.scale * scaleMultiplier;
					logo.scale.set(finalScale, finalScale, finalScale);

					// Use mobile or desktop positions based on screen size
					const isMobile = window.innerWidth < 768;
					const posX = isMobile ? data.mobileX : data.x;
					const posY = isMobile ? data.mobileY : data.y;
					const posZ = isMobile ? data.mobileZ : data.z;

					logo.position.set(posX, posY, posZ);
					if (data.rotationY !== undefined) logo.rotation.y = data.rotationY;

					// DECOUPLED: Logos are independent from head
					// Convert relative positions to world positions by adding headGroup offset
					const headPos = getResponsivePosition();
					const worldPosX = posX + headPos.x;
					const worldPosY = posY + headPos.y;

					logo.position.set(worldPosX, worldPosY, posZ);

					// Merge logo animation settings with defaults
					const animConfig = { ...DEFAULT_LOGO_ANIMATION, ...(data.animation || {}) };

					logos.push({
						mesh: logo,
						data: data, // Store original data for resize
						baseScale: data.scale, // Store base scale for resize
						originalPos: { x: worldPosX, y: worldPosY, z: posZ }, // World position
						originalRotation: { x: logo.rotation.x, y: data.rotationY || 0, z: logo.rotation.z },
						introSpin: {
							x: (index % 2 === 0 ? 1 : -1) * Math.PI * 0.8,
							y: (index % 3 === 0 ? -1 : 1) * Math.PI * 1.15,
							z: (index % 2 === 0 ? -1 : 1) * Math.PI * 0.55
						},
						animConfig: animConfig, // Store animation config per logo
						floatSpeed: 0.2 + Math.random() * 0.5,
						floatOffset: Math.random() * Math.PI * 2,
						floatAmount: LOGO_FLOAT_AMOUNT + Math.random() * LOGO_FLOAT_AMOUNT * 0.5,
						rotationSpeed: 0.1 + Math.random() * 0.15,
						isFloating: false,
						floatStartTime: 0
					});

					// Add directly to scene instead of headGroup
					scene.add(logo);
				},
				undefined,
				(err) => console.error(`Error loading ${data.file}:`, err)
			);
		});
	}

	function startHeroReveal() {
		// After preloader starts fading, reveal content
		gsap.to(canvas, { opacity: 1, duration: 1.5, delay: 0.5, ease: 'power2.out' });

		// Animate text lines with proper delays
		const lines = document.querySelectorAll('.name-line');
		lines.forEach((line, i) => {
			gsap.fromTo(
				line,
				{ opacity: 0, x: 30 },
				{ opacity: 1, x: 0, duration: 2, delay: 1 + i * 0.4, ease: 'power2.out' }
			);
		});

		// Animate underline
		const underline = document.querySelector('.underline');
		if (underline) {
			gsap.fromTo(
				underline,
				{ width: '0%' },
				{ width: '100%', duration: 1.2, delay: 1.8, ease: 'power2.out' }
			);
		}

		// Animate CV button
		const cvButton = document.querySelector('.cv-button');
		if (cvButton) {
			gsap.fromTo(
				cvButton,
				{ opacity: 0, x: 30 },
				{ opacity: 1, x: 0, duration: 1.2, delay: 1.6, ease: 'power2.out' }
			);
		}

		// The head is clickable but nothing says so — reveal the label last, and
		// only for someone who has not opened the chat before.
		let alreadyOpened = false;
		try {
			alreadyOpened = localStorage.getItem(HINT_SEEN_KEY) === '1';
		} catch {
			alreadyOpened = false;
		}

		if (!alreadyOpened) {
			hintVisible = true;
			// The element is behind an {#if}; it exists only after the next tick.
			tick().then(() => {
				if (!headHint) return;
				positionHint();
				gsap.fromTo(
					headHint,
					{ opacity: 0, y: 8 },
					{ opacity: 1, y: 0, duration: 1, delay: 2.2, ease: 'power2.out' }
				);
			});
		}

		// Animate scroll indicator
		const scrollIndicator = document.querySelector('.scroll-indicator');
		if (scrollIndicator) {
			gsap.fromTo(
				scrollIndicator,
				{ opacity: 0 },
				{ opacity: 1, duration: 1.5, delay: 2.2, ease: 'power2.out' }
			);
		}

		// 3D head entrance animation
		if (head && headGroup) {
			const finalPos = getResponsivePosition();
			const finalScale = getResponsiveScale();

			// Animate head position from offset start position
			gsap.fromTo(
				headGroup.position,
				{
					x: finalPos.x + ANIMATION_CONFIG.head.startX,
					y: finalPos.y + ANIMATION_CONFIG.head.startY,
					z: ANIMATION_CONFIG.head.startZ
				},
				{
					x: finalPos.x,
					y: finalPos.y,
					z: 0,
					duration: ANIMATION_CONFIG.head.duration,
					delay: ANIMATION_CONFIG.head.delay,
					ease: 'power2.out'
				}
			);

			// Animate head scale from small to final size
			gsap.fromTo(
				head.scale,
				{
					x: finalScale * ANIMATION_CONFIG.head.startScale,
					y: finalScale * ANIMATION_CONFIG.head.startScale,
					z: finalScale * ANIMATION_CONFIG.head.startScale
				},
				{
					x: finalScale,
					y: finalScale,
					z: finalScale,
					duration: ANIMATION_CONFIG.head.duration,
					delay: ANIMATION_CONFIG.head.delay,
					ease: 'power2.out'
				}
			);
		}

		// Animate logos individually with their own settings
		logos.forEach((logoObj) => {
			const finalScale = logoObj.baseScale * getLogoScaleMultiplier();
			const anim = logoObj.animConfig; // Use per-logo animation config
			const { originalRotation, introSpin } = logoObj;

			// Calculate start positions with offsets
			const startX = logoObj.originalPos.x + anim.startX;
			const startY = logoObj.originalPos.y + anim.startY;
			const startZ = logoObj.originalPos.z + anim.startZ;

			// Set initial position (before animation starts)
			logoObj.mesh.position.set(startX, startY, startZ);
			logoObj.mesh.rotation.set(
				originalRotation.x + introSpin.x,
				originalRotation.y + introSpin.y,
				originalRotation.z + introSpin.z
			);

			// Animate logo position from offset start position
			gsap.to(logoObj.mesh.position, {
				x: logoObj.originalPos.x,
				y: logoObj.originalPos.y,
				z: logoObj.originalPos.z,
				duration: anim.duration,
				delay: anim.delay,
				ease: 'power2.out',
				onComplete: () => {
					logoObj.isFloating = true;
					logoObj.floatStartTime = Date.now() * 0.001;
				}
			});

			gsap.to(logoObj.mesh.rotation, {
				x: originalRotation.x,
				y: originalRotation.y,
				z: originalRotation.z,
				duration: anim.duration,
				delay: anim.delay,
				ease: 'power3.out'
			});

			// Animate logo scale from small to final size
			gsap.fromTo(
				logoObj.mesh.scale,
				{
					x: finalScale * anim.startScale,
					y: finalScale * anim.startScale,
					z: finalScale * anim.startScale
				},
				{
					x: finalScale,
					y: finalScale,
					z: finalScale,
					duration: anim.duration,
					delay: anim.delay,
					ease: 'power2.out'
				}
			);
		});
	}

	/* ------------------------------------------------------------------
	   Palette + material application
	   ------------------------------------------------------------------ */

	function toneMappingFor(name) {
		switch (name) {
			case 'aces':
				return THREE.ACESFilmicToneMapping;
			case 'neutral':
				return THREE.NeutralToneMapping;
			case 'agx':
				return THREE.AgXToneMapping;
			default:
				return THREE.NoToneMapping;
		}
	}

	/** Recolour the light rig + background motes to match the active palette. */
	function applyScenePalette(palette) {
		if (palette) currentPalette = palette;
		if (!THREE || !currentPalette) return;

		const rig = currentPalette.scene;

		if (lights.ambient) {
			lights.ambient.color.set(rig.ambient);
			lights.ambient.intensity = rig.ambientIntensity;
		}
		if (lights.key) {
			lights.key.color.set(rig.key);
			lights.key.intensity = rig.keyIntensity;
		}
		if (lights.fill) {
			lights.fill.color.set(rig.fill);
			lights.fill.intensity = rig.fillIntensity;
		}
		if (lights.rim) {
			lights.rim.color.set(rig.rim);
			lights.rim.intensity = rig.rimIntensity;
		}
		if (lights.back) {
			lights.back.color.set(rig.back);
			lights.back.intensity = rig.backIntensity;
		}
		if (backgroundPoints) {
			backgroundPoints.material.color.set(rig.points);
			backgroundPoints.material.opacity = rig.pointsOpacity;
		}
		if (renderer) {
			renderer.toneMapping = toneMappingFor(rig.toneMapping);
			renderer.toneMappingExposure = rig.exposure ?? 1;
		}

		// Several presets tint themselves from the palette, so rebuild them.
		if (headLoaded) applyMaterialPreset(currentMaterial);
	}

	// Textures come from the memoised cache in $lib/theme/textures and are shared
	// between presets, so only the material itself is ours to free.
	function disposeManagedMaterials() {
		managedMaterials.forEach((material) => material.dispose());
		managedMaterials = [];
	}

	function clearPresetExtras() {
		presetExtras.forEach((object) => {
			object.parent?.remove(object);
			// NB: extras (outline hulls, inner shells) share the model's geometry —
			// only their own material is ours to dispose.
			object.material?.dispose?.();
		});
		presetExtras = [];
	}

	function presetContext(isHead) {
		return {
			THREE,
			palette: currentPalette,
			isHead,
			isMobile: window.innerWidth < 768,
			addExtra: (object) => presetExtras.push(object)
		};
	}

	/**
	 * java.glb ships POSITION + NORMAL only. Without a uv attribute every texture
	 * slot samples a single texel, and anisotropy's screen-space tangent frame
	 * degenerates. Project a cylindrical UV set from POSITION (not from normals,
	 * which are per-face on flat-shaded meshes and would give constant UVs).
	 */
	function ensureUV(geometry) {
		if (geometry.attributes.uv || !geometry.attributes.position) return;

		const position = geometry.attributes.position;
		if (!geometry.boundingBox) geometry.computeBoundingBox();
		const box = geometry.boundingBox;
		const height = Math.max(box.max.y - box.min.y, 1e-6);
		const uv = new Float32Array(position.count * 2);

		for (let i = 0; i < position.count; i++) {
			const x = position.getX(i);
			const y = position.getY(i);
			const z = position.getZ(i);
			uv[i * 2] = Math.atan2(z, x) / (Math.PI * 2) + 0.5;
			uv[i * 2 + 1] = (y - box.min.y) / height;
		}

		geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	}

	/** Build the active preset's material for every mesh inside `object`. */
	function dressObject(object, isHead) {
		if (!object || !currentMaterial || !THREE) return;
		object.traverse((child) => {
			if (!child.isMesh || child.userData.presetExtra) return;
			ensureUV(child.geometry);
			const context = { ...presetContext(isHead), mesh: child, scene };
			const material = currentMaterial.build(context);
			managedMaterials.push(material);
			child.material = material;
			currentMaterial.setup?.({ ...context, material });
		});
	}

	/** Swap every managed mesh over to a new material preset. */
	function applyMaterialPreset(preset) {
		if (preset) currentMaterial = preset;
		if (!THREE || !currentMaterial) return;

		clearPresetExtras();
		disposeManagedMaterials();

		if (head) dressObject(head, true);
		logos.forEach((logo) => dressObject(logo.mesh, false));
	}

	function addBackgroundGrid() {
		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		for (let i = 0; i < 200; i++) {
			vertices.push(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 2 - 5);
		}
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({
			color: 0x161411,
			size: 0.05,
			transparent: true,
			opacity: 0.05
		});
		backgroundPoints = new THREE.Points(geometry, material);
		scene.add(backgroundPoints);
		applyScenePalette(currentPalette);
	}

	/** The canvas fills the hero, so its own box is the truth — not the window. */
	function canvasSize() {
		return {
			width: canvas?.clientWidth || window.innerWidth,
			height: canvas?.clientHeight || window.innerHeight
		};
	}

	function onResize() {
		const size = canvasSize();
		// Ignore no-op resizes: mobile browsers fire these while chrome animates,
		// and re-sizing on each one makes the models visibly breathe.
		if (size.width === rendered.width && size.height === rendered.height) return;
		rendered = size;

		camera.aspect = size.width / size.height;
		camera.updateProjectionMatrix();
		renderer.setSize(size.width, size.height, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, size.width < 768 ? 1.5 : 2));
		if (head && headLoaded && headGroup) {
			const newScale = getResponsiveScale();
			const pos = getResponsivePosition();
			head.scale.set(newScale, newScale, newScale);
			headGroup.position.x = pos.x;
			headGroup.position.y = pos.y;
		}

		// Update logo positions and scales for responsive layout
		const isMobile = window.innerWidth < 768;
		const headPos = getResponsivePosition();

		logos.forEach((logoObj) => {
			if (logoObj.data) {
				// Update position (convert relative to world position)
				const relPosX = isMobile ? logoObj.data.mobileX : logoObj.data.x;
				const relPosY = isMobile ? logoObj.data.mobileY : logoObj.data.y;
				const posZ = isMobile ? logoObj.data.mobileZ : logoObj.data.z;

				// Convert to world position by adding head offset
				const worldPosX = relPosX + headPos.x;
				const worldPosY = relPosY + headPos.y;

				logoObj.originalPos = { x: worldPosX, y: worldPosY, z: posZ };

				// Update scale
				const scaleMultiplier = getLogoScaleMultiplier();
				const finalScale = logoObj.baseScale * scaleMultiplier;
				logoObj.mesh.scale.set(finalScale, finalScale, finalScale);
			}
		});
	}

	function handleScroll() {}

	function updateHeadHover(event) {
		if (!raycaster || !camera || !head || !heroSection) return false;

		const rect = heroSection.getBoundingClientRect();
		const isInsideHero =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;

		if (!isInsideHero) return false;

		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(pointer, camera);

		return raycaster.intersectObject(head, true).length > 0;
	}

	function handlePointerMove(event) {
		pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;

		const hovering = updateHeadHover(event);
		if (hovering === headHovered) return;

		headHovered = hovering;
		document.body.style.cursor = hovering ? 'pointer' : '';
	}

	function talkToColin() {
		dismissHint();
		openChat();
	}

	function dismissHint() {
		hintVisible = false;
		try {
			localStorage.setItem(HINT_SEEN_KEY, '1');
		} catch {
			/* private mode — the hint simply shows again next visit */
		}
	}

	function handleClick(event) {
		if (updateHeadHover(event)) {
			talkToColin();
		}
	}

	/** Pin the hint under the head, in screen space. */
	function positionHint() {
		if (!headHint || !head || !camera || !THREE) return;
		if (!hintProjection) hintProjection = new THREE.Vector3();

		head.getWorldPosition(hintProjection);
		// A little below the chin, in world units, scaled with the head itself.
		hintProjection.y -= getResponsiveScale() * 0.42;
		hintProjection.project(camera);

		headHint.style.left = `${(hintProjection.x * 0.5 + 0.5) * 100}%`;
		headHint.style.top = `${(-hintProjection.y * 0.5 + 0.5) * 100}%`;
	}

	function animate() {
		if (paused) return; // stop RAF loop when tab is hidden or on destroy
		rafId = requestAnimationFrame(animate);
		if (!isSceneReady) return; // <— prevents early renders
		const time = Date.now() * 0.001;
		const baseScale = getResponsiveScale();

		if (head && headLoaded) {
			const headFloatY = Math.sin(time * 0.3 + headFloatOffset) * 0.08;
			const headDriftX = Math.cos(time * 0.25 + headFloatOffset) * 0.05;
			head.position.x = headDriftX;
			head.position.y = headFloatY;
			pointerEased.x += (pointerTarget.x - pointerEased.x) * 0.045;
			pointerEased.y += (pointerTarget.y - pointerEased.y) * 0.045;

			head.rotation.y =
				Math.PI + Math.sin(time * 0.2 + headFloatOffset) * 0.05 + pointerEased.x * LOOK_AMOUNT.x;
			head.rotation.x = -pointerEased.y * LOOK_AMOUNT.y;
			head.scale.setScalar(baseScale);
		}

		logos.forEach((obj) => {
			if (!obj.isFloating) return;

			const { mesh, originalPos, floatSpeed, floatAmount, rotationSpeed, originalRotation } = obj;
			const floatTime = time - obj.floatStartTime;
			const blendFactor = gsap.utils.clamp(0, 1, floatTime / 1.2);
			const easedBlend = 1 - Math.pow(1 - blendFactor, 3);
			const yWave = Math.sin(floatTime * floatSpeed);
			const xWave = 1 - Math.cos(floatTime * floatSpeed * 0.7);
			const zWave = Math.sin(floatTime * floatSpeed * 0.5);
			const rotationWave = Math.sin(floatTime * rotationSpeed);

			mesh.position.y = originalPos.y + yWave * floatAmount * easedBlend;
			mesh.position.x = originalPos.x + xWave * floatAmount * 0.25 * easedBlend;
			mesh.position.z = originalPos.z + zWave * floatAmount * 0.3 * easedBlend;
			mesh.rotation.y = originalRotation.y + rotationWave * 0.1 * easedBlend;
		});

		positionHint();
		renderer.render(scene, camera);
	}
</script>

<section bind:this={heroSection} class="hero-section">
	<canvas bind:this={canvas} class="webgl-canvas"></canvas>

	{#if hintVisible}
		<button
			class="head-hint"
			bind:this={headHint}
			on:click={talkToColin}
			aria-label="Talk to Colin's AI clone"
		>
			<span class="hint-dot"></span>
			Click my head to talk to me
		</button>
	{/if}

	<div class="hero-content">
		<div class="name-wrapper">
			<h1 class="name-line name-line-1">Colin</h1>
			<h1 class="name-line name-line-2">Salvatore</h1>
			<h1 class="name-line name-line-3">
				Nardo
				<span class="underline"></span>
			</h1>
		</div>

		<a
			href="/cv/Colin_Salvatore_Nardo_MSci.pdf"
			target="_blank"
			rel="noopener noreferrer"
			class="cv-button"
		>
			View CV
		</a>
	</div>

	<button class="scroll-indicator" on:click={scrollToProjects}>
		<span class="scroll-text">My Projects</span>
		<svg
			class="scroll-arrow"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M12 5v14M19 12l-7 7-7-7" />
		</svg>
	</button>
</section>

<style>
	.hero-section {
		position: relative;
		width: 100%;
		height: 100vh;
		height: 100svh;
		overflow: hidden;
	}

	.webgl-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		pointer-events: auto;
		opacity: 0;
	}

	.head-hint {
		position: absolute;
		z-index: 3;
		transform: translate(-50%, 0);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--overlay);
		backdrop-filter: blur(6px);
		color: var(--white);
		font-family: var(--font-heading);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		white-space: nowrap;
		cursor: pointer;
		opacity: 0;
	}

	.head-hint:hover,
	.head-hint:focus-visible {
		border-color: var(--accent);
		color: var(--accent-deep);
	}

	.hint-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent);
		flex: none;
		animation: hint-pulse 2.4s ease-in-out infinite;
	}

	@keyframes hint-pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5);
			opacity: 0.45;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hint-dot {
			animation: none;
		}
	}

	.hero-content {
		position: relative;
		z-index: 2;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
		padding-right: 15%;
	}

	.name-wrapper {
		margin-bottom: 3rem;
	}

	.name-line {
		font-size: clamp(3rem, 8vw, 7rem);
		margin: 0;
		opacity: 0;
	}

	.name-line-1 {
		font-weight: 700;
		color: var(--white);
		margin-left: 0;
	}

	.name-line-2 {
		font-weight: 700;
		font-style: italic;
		color: var(--accent);
		margin-left: 2rem;
	}

	.name-line-3 {
		font-weight: 700;
		color: var(--white);
		position: relative;
		margin-left: 0;
	}

	.underline {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		background: var(--accent);
		width: 0;
	}

	.cv-button {
		padding: 1rem 2.5rem;
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 600;
		color: var(--white);
		background: transparent;
		border: 2px solid var(--white);
		border-radius: 50px;
		cursor: pointer;
		opacity: 0;
		position: relative;
		overflow: hidden;
		text-decoration: none;
		display: inline-block;
		transition: all 0.3s var(--ease);
	}

	.cv-button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: var(--accent);
		transform: translate(-50%, -50%);
		transition:
			width 0.6s var(--ease),
			height 0.6s var(--ease);
		z-index: -1;
	}

	.cv-button:hover {
		color: var(--black);
		border-color: var(--accent);
		transform: translateY(-4px);
	}

	.cv-button:hover::before {
		width: 300px;
		height: 300px;
	}

	.cv-button:active {
		animation: ripple 0.6s var(--ease);
	}

	@keyframes ripple {
		0% {
			box-shadow: 0 0 0 0 var(--shadow-strong);
		}
		100% {
			box-shadow: 0 0 0 20px transparent;
		}
	}

	.scroll-indicator {
		position: absolute;
		bottom: 3rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		color: var(--white);
		cursor: pointer;
		opacity: 0;
		animation: float 3s ease-in-out infinite;
	}

	.scroll-text {
		font-family: var(--font-heading);
		font-size: 0.9rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.scroll-arrow {
		color: var(--accent);
		animation: bounce 2s ease-in-out infinite;
	}

	.scroll-indicator:hover {
		opacity: 1;
	}

	.scroll-indicator:hover .scroll-arrow {
		transform: translateY(4px);
	}

	@keyframes smoothFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes smoothFadeInRight {
		from {
			opacity: 0;
			transform: translateX(30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(-10px);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	@media (max-width: 1024px) {
		.hero-content {
			padding-right: 8%;
		}

		.name-line {
			font-size: clamp(2.5rem, 9vw, 6rem);
		}
	}

	@media (max-width: 768px) {
		.hero-section {
			height: 100svh;
		}

		.hero-content {
			align-items: center;
			padding-right: 5%;
			padding-left: 5%;
			justify-content: flex-end;
			padding-bottom: 8rem;
		}

		.name-line {
			font-size: clamp(2rem, 10vw, 4rem);
		}

		.name-line-2,
		.name-line-3 {
			margin-left: 0;
		}

		.name-wrapper {
			margin-bottom: 2rem;
		}

		.cv-button {
			padding: 0.875rem 2rem;
			font-size: 0.9rem;
		}

		.scroll-indicator {
			bottom: 2rem;
		}
	}

	@media (max-width: 480px) {
		.head-hint {
			font-size: 0.7rem;
			padding: 0.42rem 0.75rem;
		}

		.hero-content {
			padding-right: 1rem;
			padding-left: 1rem;
			justify-content: flex-end;
			padding-bottom: 7rem;
		}

		.name-line {
			font-size: clamp(1.75rem, 12vw, 3rem);
		}

		.name-wrapper {
			margin-bottom: 1.5rem;
		}

		.cv-button {
			padding: 0.75rem 1.5rem;
			font-size: 0.85rem;
		}

		.scroll-indicator {
			bottom: 1.5rem;
		}

		.scroll-text {
			font-size: 0.8rem;
		}
	}
</style>
