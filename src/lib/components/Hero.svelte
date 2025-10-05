<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
	import { gsap } from 'gsap';

	let canvas;
	let scene, camera, renderer, head;
	let headLoaded = false;
	let logos = [];
	let headGroup;
	let headFloatOffset = Math.random() * Math.PI * 2;
	let isSceneReady = false;
	let introAnimationComplete = false; // Track when intro animations finish
	let floatingStartTime = 0; // Time when floating animation starts

	const LOGO_FLOAT_AMOUNT = 0.1;

	// ===== HEAD POSITIONING CONFIG =====
	// Customize these values for desktop and mobile!
	const HEAD_POSITIONS = {
		desktop: { x: -1, y: 0 },
		mobile: { x: 0, y: 0.4 }  // Mobile head position (customize this!)
	};
	// ===================================

	// ===== HEAD & LOGO SCALE CONFIG =====
	// Customize scale (size) for desktop and mobile!
	const HEAD_SCALE = {
		desktop: 3.6 * 0.7,  // Desktop head size
		mobile: 2.2 * 0.7    // Mobile head size (customize this!)
	};

	const LOGO_SCALE_MULTIPLIER = {
		desktop: 1.0,  // Desktop logo size (1.0 = normal)
		mobile: 0.7    // Mobile logo size multiplier (customize this!)
	};
	// ====================================

	// ===== ANIMATION CONFIG =====
	// Customize animation distances and timing!
	const ANIMATION_CONFIG = {
		head: {
			startX: 0,          // X offset from final position (0 = no offset, + = right, - = left)
			startY: 4,          // Y offset from final position (0 = no offset, + = up, - = down)
			startZ: -4,         // How far back head starts (negative = further away)
			startScale: 0.5,    // Starting scale multiplier (0.5 = half size)
			duration: 1.8,      // Animation duration in seconds
			delay: 0.6          // Delay before animation starts
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

	onMount(() => {
		// Moved this line inside onMount
		document.body.classList.add('loading');

		initScene();
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', handleScroll);
			if (renderer) renderer.dispose();
		};
	});

	function scrollToProjects() {
		const projectsSection = document.querySelector('.chat-projects-section');
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

	function initScene() {
		const manager = new THREE.LoadingManager();
		manager.onLoad = () => {
			warmUpRenderer();
			isSceneReady = true;
			startHeroReveal();
			animate();
		};

		const gltfLoader = new GLTFLoader(manager);
		const rgbeLoader = new RGBELoader(manager);

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		rgbeLoader.load(
			'/studio_small_03_1k.hdr',
			(texture) => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.environment = texture;
			},
			undefined,
			(error) => console.error('Error loading HDR:', error)
		);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);
		const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
		keyLight.position.set(5, 5, 5);
		scene.add(keyLight);
		const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
		fillLight.position.set(-5, 0, -5);
		scene.add(fillLight);
		const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
		rimLight.position.set(0, 5, -5);
		scene.add(rimLight);
		const backLight = new THREE.PointLight(0xffffff, 1.0);
		backLight.position.set(0, 0, -3);
		scene.add(backLight);

		gltfLoader.load(
			'/head.glb',
			(gltf) => {
				head = gltf.scene;
				head.traverse((child) => {
					if (child.isMesh) {
						child.material = new THREE.MeshStandardMaterial({
							color: 0x333333,
							roughness: 0.4,
							metalness: 0.9
						});
					}
				});

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
		animate();
	}

	function loadLogos(loader) {
		// Desktop positions + Individual animation settings
		const logoFiles = [
			{ 
				file: '/c.glb', 
				scale: 0.01, 
				x: 1.3, y: 1.3, z: 0, 
				rotationY: -Math.PI / 6,
				// Mobile positions
				mobileX: 0.5, mobileY: 1.1, mobileZ: 0,
				// Animation settings (optional - uses defaults if not specified)
				animation: {
					startX: 3,      // Come from right
					startY: 10,
					startZ: -15,
					startScale: 0.3,
					duration: 2.0,
					delay: 0.8
				}
			},
			{ 
				file: '/css_logo_3d_model.glb', 
				scale: 1, 
				x: 1.6, y: 1.3, z: 0.8,
				mobileX: 1.2, mobileY: 1.5, mobileZ: 0.5,
				animation: {
					startX: 2,
					startY: 2,      // Come from top-right
					startZ: -12,
					startScale: 0.2,
					duration: 1.8,
					delay: 0.9
				}
			},
			{ 
				file: '/html_logo_3d_model.glb', 
				scale: 0.3, 
				x: 0, y: 1.5, z: 1,
				mobileX: 0, mobileY: 1.5, mobileZ: 0.8,
				animation: {
					startY: 5,      // Come from top
					startZ: -10,
					delay: 1.0
				}
			},
			{ 
				file: '/java.glb', 
				scale: 0.2, 
				x: -1.1, y: 1.1, z: 0.8,
				mobileX: -0.6, mobileY: 0.9, mobileZ: 0.5,
				animation: {
					startX: -10,     // Come from left
					startY: 10,
					startZ: -18,
					delay: 1.1
				}
			},
			{ 
				file: '/python.glb', 
				scale: 0.01, 
				x: -1.4, y: 0, z: 0,
				mobileX: -0.8, mobileY: 0, mobileZ: 0,
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
				x: 1.1, y: -1.0, z: 0.8,
				mobileX: 0.7, mobileY: -0.3, mobileZ: 0.5,
				animation: {
					startX: 3,
					startY: -10,     // Come from bottom
					startZ: -14,
					delay: 1.3
				}
			}
		];

		logoFiles.forEach((data) => {
			loader.load(
				data.file,
				(gltf) => {
					const logo = gltf.scene;
					logo.traverse((child) => {
						if (child.isMesh) {
							child.material = new THREE.MeshStandardMaterial({
								color: 0xc5c5c5,
								roughness: 0.1,
								metalness: 0.95
							});
						}
					});

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
						originalRotation: { y: data.rotationY || 0 },
						animConfig: animConfig, // Store animation config per logo
						floatSpeed: 0.2 + Math.random() * 0.5,
						floatOffset: Math.random() * Math.PI * 2,
						floatAmount: LOGO_FLOAT_AMOUNT + Math.random() * LOGO_FLOAT_AMOUNT * 0.5,
						rotationSpeed: 0.1 + Math.random() * 0.15
					});

					// Add directly to scene instead of headGroup
					scene.add(logo);
				},
				undefined,
				(err) => console.error(`Error loading ${data.file}:`, err)
			);
		});
	}

	function handleSceneReady() {
		isSceneReady = true;
		startHeroReveal();
	}

	function startHeroReveal() {
		// Smoothly fade out preloader first
		const preloader = document.querySelector('.preloader');
		if (preloader) {
			gsap.to(preloader, {
				opacity: 0,
				duration: 0.8,
				ease: 'power2.inOut',
				onComplete: () => {
					preloader.remove();
					document.body.classList.remove('loading');
				}
			});
		}

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
			gsap.fromTo(headGroup.position, 
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
			gsap.fromTo(head.scale, 
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
		let maxDelay = 0;
		logos.forEach((logoObj) => {
			const finalScale = logoObj.baseScale * getLogoScaleMultiplier();
			const anim = logoObj.animConfig; // Use per-logo animation config
			
			// Calculate start positions with offsets
			const startX = logoObj.originalPos.x + anim.startX;
			const startY = logoObj.originalPos.y + anim.startY;
			const startZ = logoObj.originalPos.z + anim.startZ;
			
			// Set initial position (before animation starts)
			logoObj.mesh.position.set(startX, startY, startZ);
			
			// Animate logo position from offset start position
			gsap.to(logoObj.mesh.position,
				{ 
					x: logoObj.originalPos.x, 
					y: logoObj.originalPos.y, 
					z: logoObj.originalPos.z,
					duration: anim.duration,
					delay: anim.delay,
					ease: 'power2.out'
				}
			);
			
			// Animate logo scale from small to final size
			gsap.fromTo(logoObj.mesh.scale,
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
			
			// Track the longest animation time
			const totalTime = anim.delay + anim.duration;
			if (totalTime > maxDelay) maxDelay = totalTime;
		});
		
		// Enable floating animation after all intro animations complete
		setTimeout(() => {
			introAnimationComplete = true;
			floatingStartTime = Date.now() * 0.001; // Record when floating starts
		}, maxDelay * 1000);
	}

	function addBackgroundGrid() {
		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		for (let i = 0; i < 200; i++) {
			vertices.push(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 2 - 5);
		}
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.05 });
		const points = new THREE.Points(geometry, material);
		scene.add(points);
	}

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
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

	function animate() {
		requestAnimationFrame(animate);
		if (!isSceneReady) return; // <— prevents early renders
		const time = Date.now() * 0.001;

		if (head && headLoaded) {
			const headFloatY = Math.sin(time * 0.3 + headFloatOffset) * 0.08;
			const headDriftX = Math.cos(time * 0.25 + headFloatOffset) * 0.05;
			head.position.x = headDriftX;
			head.position.y = headFloatY;
			head.rotation.y = Math.PI + Math.sin(time * 0.2 + headFloatOffset) * 0.05;
		}

		// Only apply floating animation after intro animation completes
		if (introAnimationComplete) {
			// Use relative time from when floating started to avoid jolts
			const floatTime = time - floatingStartTime;
			
			// Smooth blend-in: amplitude goes from 0 to 1 over 1 second
			const blendDuration = 1.0; // seconds
			const blendFactor = Math.min(floatTime / blendDuration, 1.0);
			
			logos.forEach((obj) => {
				const { mesh, originalPos, floatSpeed, floatOffset, floatAmount, rotationSpeed, originalRotation } = obj;
				
				// Apply floating with smooth blend-in
				mesh.position.y = originalPos.y + Math.sin(floatTime * floatSpeed + floatOffset) * floatAmount * blendFactor;
				mesh.position.x = originalPos.x + Math.cos(floatTime * floatSpeed * 0.7 + floatOffset) * floatAmount * 0.5 * blendFactor;
				mesh.position.z = originalPos.z + Math.sin(floatTime * floatSpeed * 0.5 + floatOffset) * floatAmount * 0.3 * blendFactor;
				mesh.rotation.y = originalRotation.y + Math.sin(floatTime * rotationSpeed + floatOffset) * 0.1 * blendFactor;
			});
		}

		renderer.render(scene, camera);
	}
</script>

<div class="preloader">
	<span>Loading...</span>
</div>

<section class="hero-section">
	<canvas bind:this={canvas} class="webgl-canvas"></canvas>

	<div class="hero-content">
		<div class="name-wrapper">
			<h1 class="name-line name-line-1">Colin</h1>
			<h1 class="name-line name-line-2">Salvatore</h1>
			<h1 class="name-line name-line-3">
				Nardo
				<span class="underline"></span>
			</h1>
		</div>

		<a href="/cv/Colin_Salvatore_Nardo_MSci.pdf" target="_blank" rel="noopener noreferrer" class="cv-button">
		View CV
	</a>
	</div>

	<button class="scroll-indicator" on:click={scrollToProjects}>
		<span class="scroll-text">My Projects</span>
		<svg
			class="scroll-arrow"
			width="24"
			height="24"
			viewBox="0 0 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M12 5v14M19 12l-7 7-7-7" />
		</svg>
	</button>
</section>

<style>
	:global(body.loading) {
		overflow: hidden !important;
		height: 100vh;
		position: fixed;
		width: 100%;
	}
	:global(body:not(.loading)) {
		overflow: auto;
		position: static;
	}

	.preloader {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: black;
		color: white;
		z-index: 9999;
		font-family: var(--font-heading);
		font-size: 1.2rem;
		opacity: 1;
	}

	.hero-section {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.webgl-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		pointer-events: none;
		opacity: 0;
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
		color: var(--grey-soft);
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
		background: var(--white);
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
		background: var(--white);
		transform: translate(-50%, -50%);
		transition: width 0.6s var(--ease), height 0.6s var(--ease);
		z-index: -1;
	}

	.cv-button:hover {
		color: var(--black);
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
			box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
		}
		100% {
			box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
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