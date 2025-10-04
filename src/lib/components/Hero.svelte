<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
	import gsap from 'gsap';

	let canvas;
	let scene, camera, renderer, head;
	let headLoaded = false;
	let logos = []; // Store logo objects with their animation data
	let headGroup; // Group containing head and logos
	let headFloatOffset = Math.random() * Math.PI * 2; // Random offset for head float

	// ===== CONFIGURATION =====
	const LOGO_FLOAT_AMOUNT = 0.1; // How much logos float (0.1-0.5 recommended)
	// =========================

	// Responsive scale and position helpers
	function getResponsiveScale() {
		const width = window.innerWidth;
		if (width < 480) return 2.2 * 0.7;
		if (width < 768) return 2.8 * 0.7;
		if (width < 1024) return 3.2 * 0.7;
		return 3.6 * 0.7;
	}

	function getResponsivePosition() {
		const width = window.innerWidth;
		if (width < 768) return { x: 0, y: -0.3 };
		return { x: -1, y: 0 };
	}

	onMount(() => {
		initScene();
		animate();

		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', handleScroll);
			if (renderer) renderer.dispose();
		};
	});

	function playIntroAnimation() {
		const finalHeadScale = getResponsiveScale();
		const tl = gsap.timeline();

		// 1. Animate head scaling into view
		tl.to(head.scale, {
			x: finalHeadScale,
			y: finalHeadScale,
			z: finalHeadScale,
			duration: 1.5,
			ease: 'expo.out'
		});

		// 2. Animate logos flying into their final positions with a stagger
		tl.to(
			logos.map((l) => l.mesh.position),
			{
				x: (i) => logos[i].originalPos.x,
				y: (i) => logos[i].originalPos.y,
				z: (i) => logos[i].originalPos.z,
				duration: 1.5,
				ease: 'expo.out',
				stagger: 0.08
			},
			'-=1.3' // Overlap animations for a smoother sequence
		);
	}

	function scrollToProjects() {
		const projectsSection = document.querySelector('.chat-projects-section');
		if (projectsSection && window.lenis) {
			window.lenis.scrollTo(projectsSection, { duration: 2 });
		} else if (projectsSection) {
			projectsSection.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function initScene() {
		// ===== Preloading Setup =====
		const loadingManager = new THREE.LoadingManager();
		loadingManager.onLoad = () => {
			// Trigger animation once all managed assets are loaded
			playIntroAnimation();
		};
		const gltfLoader = new GLTFLoader(loadingManager);
		const rgbeLoader = new RGBELoader(loadingManager);
		// ============================

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Load environment map
		rgbeLoader.load(
			'/studio_small_03_1k.hdr',
			(texture) => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.environment = texture;
			},
			undefined,
			(error) => console.error('An error occurred loading the environment map.', error)
		);

		// Lighting setup (intensities already increased)
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

		// Load head model
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
						child.material.needsUpdate = true;
					}
				});

				headGroup = new THREE.Group();
				const pos = getResponsivePosition();
				headGroup.position.set(pos.x, pos.y, 0);

				// Set initial state for animation: start scaled to 0
				head.scale.set(0, 0, 0);
				head.rotation.set(0, Math.PI, 0);

				headGroup.add(head);
				scene.add(headGroup);
				headLoaded = true;
				loadLogos(gltfLoader); // Pass loader with manager to logos
			},
			undefined,
			(error) => console.error('Error loading model:', error)
		);

		addBackgroundGrid();
	}

	function loadLogos(loader) {
		const logoFiles = [
			{ file: '/c.glb', scale: 0.01, x: 1.3, y: 1.3, z: 0, rotationY: -Math.PI / 6 },
			{ file: '/css_logo_3d_model.glb', scale: 1, x: 1.6, y: 1.3, z: 0.8, rotationY: 0 },
			{ file: '/html_logo_3d_model.glb', scale: 0.3, x: 0, y: 1.5, z: 1, rotationY: 0 },
			{ file: '/java.glb', scale: 0.2, x: -1.1, y: 1.1, z: 0.8, rotationY: 0 },
			{ file: '/python.glb', scale: 0.01, x: -1.6, y: 0, z: 0, rotationY: 0 },
			{ file: '/react_logo.glb', scale: 0.17, x: 1.1, y: -1.3, z: 0.8, rotationY: 0 }
		];

		logoFiles.forEach((logoData) => {
			loader.load(
				logoData.file,
				(gltf) => {
					const logo = gltf.scene;
					logo.traverse((child) => {
						if (child.isMesh) {
							child.material = new THREE.MeshStandardMaterial({
								color: 0xc5c5c5,
								roughness: 0.1,
								metalness: 0.95
							});
							child.material.needsUpdate = true;
						}
					});

					const scale = logoData.scale;
					logo.scale.set(scale, scale, scale);

					// Set initial state for animation: start far off-screen
					const finalPos = new THREE.Vector3(logoData.x, logoData.y, logoData.z);
					logo.position.set(finalPos.x * 4, finalPos.y * 3 + 5, finalPos.z - 20);

					if (logoData.rotationY !== undefined) {
						logo.rotation.y = logoData.rotationY;
					}

					const logoObj = {
						mesh: logo,
						originalPos: { x: logoData.x, y: logoData.y, z: logoData.z },
						originalRotation: { x: 0, y: logoData.rotationY || 0, z: 0 },
						floatSpeed: 0.2 + Math.random() * 0.5,
						floatOffset: Math.random() * Math.PI * 2,
						floatAmount: LOGO_FLOAT_AMOUNT + Math.random() * LOGO_FLOAT_AMOUNT * 0.5,
						rotationSpeed: 0.1 + Math.random() * 0.15
					};
					logos.push(logoObj);
					headGroup.add(logo);
				},
				undefined,
				(error) => console.error(`Error loading logo ${logoData.file}:`, error)
			);
		});
	}

	function addBackgroundGrid() {
		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		for (let i = 0; i < 200; i++) {
			vertices.push(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 2 - 5);
		}
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.05,
			transparent: true,
			opacity: 0.05
		});
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
			// Only update scale if animation is not running or finished
			if (gsap.globalTimeline.getChildren().every((t) => t.progress() === 1)) {
				head.scale.set(newScale, newScale, newScale);
			}
			headGroup.position.x = pos.x;
			headGroup.position.y = pos.y;
		}
	}

	function handleScroll() {
		if (!canvas || !headGroup || !camera) return;
		const scrollY = window.scrollY;
		const heroSection = document.querySelector('.hero-section');
		const chatSection = document.querySelector('.chat-projects-section');
		if (heroSection && chatSection) {
			const heroHeight = heroSection.offsetHeight;
			const chatOffset = chatSection.offsetTop;
			const scrollProgress = Math.min(scrollY / heroHeight, 1);
			const moveStart = 0.3;
			const moveEnd = 1.2;
			if (scrollProgress > moveStart) {
				const moveProgress = Math.min((scrollProgress - moveStart) / (moveEnd - moveStart), 1);
				const eased = 1 - Math.pow(1 - moveProgress, 3);
				const startPos = getResponsivePosition();
				const width = window.innerWidth;
				let targetX, targetY, targetScale;
				if (width < 768) {
					targetX = 0;
					targetY = 1.5;
					targetScale = 1.8;
				} else {
					targetX = -3.5;
					targetY = 0.5;
					targetScale = 2.4;
				}
				headGroup.position.x = startPos.x + (targetX - startPos.x) * eased;
				headGroup.position.y = startPos.y + (targetY - startPos.y) * eased;
				const startScale = getResponsiveScale();
				const newScale = startScale + (targetScale - startScale) * eased;
				head.scale.set(newScale, newScale, newScale);
				canvas.style.opacity = '1';
				const maxTranslate = chatOffset - heroHeight;
				const translateY = Math.min(scrollY - heroHeight, maxTranslate);
				canvas.style.transform = `translateY(${translateY}px)`;
			} else {
				const pos = getResponsivePosition();
				headGroup.position.x = pos.x;
				headGroup.position.y = pos.y;
				const scale = getResponsiveScale();
				// Only update scale if animation is not running or finished
				if (gsap.globalTimeline.getChildren().every((t) => t.progress() === 1)) {
					head.scale.set(scale, scale, scale);
				}
				canvas.style.opacity = '1';
				canvas.style.transform = 'translateY(0)';
			}
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		const time = Date.now() * 0.001;
		if (head && headLoaded) {
			const headFloatY = Math.sin(time * 0.3 + headFloatOffset) * 0.08;
			const headDriftX = Math.cos(time * 0.25 + headFloatOffset) * 0.05;
			head.position.x = headDriftX;
			head.position.y = headFloatY;
			head.position.z = 0;
			const rotationAmount = Math.sin(time * 0.2 + headFloatOffset) * 0.05;
			head.rotation.y = Math.PI + rotationAmount;
		}

		// Only start floating logos after the intro animation is complete
		if (gsap.globalTimeline.getChildren().every((t) => t.progress() === 1)) {
			logos.forEach((logoObj) => {
				const { mesh, originalPos, floatSpeed, floatOffset, floatAmount, rotationSpeed, originalRotation } = logoObj;
				const floatY = Math.sin(time * floatSpeed + floatOffset) * floatAmount;
				const driftX = Math.cos(time * floatSpeed * 0.7 + floatOffset) * floatAmount * 0.5;
				const driftZ = Math.sin(time * floatSpeed * 0.5 + floatOffset) * floatAmount * 0.3;
				mesh.position.x = originalPos.x + driftX;
				mesh.position.y = originalPos.y + floatY;
				mesh.position.z = originalPos.z + driftZ;
				const rotationAmount = Math.sin(time * rotationSpeed + floatOffset) * 0.1;
				mesh.rotation.y = originalRotation.y + rotationAmount;
			});
		}
		renderer.render(scene, camera);
	}
</script>

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

		<button class="cv-button"> View CV </button>
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
	.hero-section {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.webgl-canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
		pointer-events: none;
		opacity: 0;
		animation: smoothFadeIn 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 0.3s;
		will-change: transform, opacity;
		transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
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
		animation: smoothFadeInRight 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.name-line-1 {
		font-weight: 700;
		color: var(--white);
		animation-delay: 0.5s;
		margin-left: 0;
	}

	.name-line-2 {
		font-weight: 700;
		font-style: italic;
		color: var(--grey-soft);
		animation-delay: 0.8s;
		margin-left: 2rem;
	}

	.name-line-3 {
		font-weight: 700;
		color: var(--white);
		animation-delay: 1.1s;
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
		animation: drawLine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 1.6s;
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
		animation: smoothFadeInRight 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 1.4s;
		position: relative;
		overflow: hidden;
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
		animation: smoothFadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards,
			float 3s ease-in-out infinite;
		animation-delay: 2s, 3.5s;
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
			justify-content: center;
			padding-top: 0;
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
			justify-content: center;
			padding-top: 0;
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