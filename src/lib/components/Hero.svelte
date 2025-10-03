<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

	let canvas;
	let scene, camera, renderer, head;
	let mouseX = 0;
	let targetRotationY = 0;
	let headLoaded = false;

	onMount(() => {
		initScene();
		animate();

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('resize', onResize);

		// Handle scroll for head transition
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
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

	function initScene() {
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x000000);

		camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Lighting for plaster bust effect
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);

		const keyLight = new THREE.DirectionalLight(0xffffff, 1);
		keyLight.position.set(5, 5, 5);
		scene.add(keyLight);

		const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
		fillLight.position.set(-5, 0, -5);
		scene.add(fillLight);

		// Load head model
		const loader = new GLTFLoader();
		loader.load(
			'/head.glb',
			(gltf) => {
				head = gltf.scene;
				head.traverse((child) => {
					if (child.isMesh) {
						child.material = new THREE.MeshStandardMaterial({
							color: 0xffffff,
							roughness: 0.7,
							metalness: 0.1
						});
					}
				});

				// Scale and position - start invisible for fade in
				head.scale.set(0, 0, 0);
				head.position.set(-1, 0, 0);

				scene.add(head);

				// Smooth fade in animation using easing
				let progress = 0;
				const duration = 2000; // 2 seconds
				const startTime = Date.now();
				const targetScale = 3.6; // 1.8x bigger than original 2

				const fadeIn = setInterval(() => {
					const elapsed = Date.now() - startTime;
					progress = Math.min(elapsed / duration, 1);

					// Ease out cubic for smooth deceleration
					const eased = 1 - Math.pow(1 - progress, 3);

					head.scale.set(eased * targetScale, eased * targetScale, eased * targetScale);

					if (progress >= 1) {
						clearInterval(fadeIn);
						headLoaded = true;
					}
				}, 16);
			},
			undefined,
			(error) => {
				console.error('Error loading model:', error);
			}
		);

		// Add faint background grid
		addBackgroundGrid();
	}

	function addBackgroundGrid() {
		const geometry = new THREE.BufferGeometry();
		const vertices = [];

		for (let i = 0; i < 200; i++) {
			vertices.push(
				Math.random() * 20 - 10,
				Math.random() * 20 - 10,
				Math.random() * 2 - 5
			);
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

	function onMouseMove(event) {
		mouseX = (event.clientX / window.innerWidth) * 2 - 1;
	}

	function onResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function handleScroll() {
		const scrollY = window.scrollY;
		const heroSection = document.querySelector('.hero-section');

		if (heroSection && head) {
			const heroHeight = heroSection.offsetHeight;
			const scrollProgress = Math.min(scrollY / heroHeight, 1);

			// Keep head visible and positioned properly during scroll
			head.position.x = -1;
			head.position.y = 0 - scrollProgress * 2;
			head.scale.setScalar(3.6 * (1 - scrollProgress * 0.5));
		}
	}

	function animate() {
		requestAnimationFrame(animate);

		if (head) {
			// Idle rotation
			targetRotationY += 0.002;

			// Mouse parallax effect (Y-axis only)
			const mouseRotationY = mouseX * 0.2;

			head.rotation.y += (targetRotationY + mouseRotationY - head.rotation.y) * 0.05;
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

		<button class="cv-button">
			View CV
		</button>
	</div>

	<button class="scroll-indicator" on:click={scrollToProjects}>
		<span class="scroll-text">My Projects</span>
		<svg class="scroll-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 5v14M19 12l-7 7-7-7"/>
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
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		opacity: 0;
		animation: smoothFadeIn 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 0.3s;
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
		animation: smoothFadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, float 3s ease-in-out infinite;
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
			opacity: 0.7;
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
		0%, 100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(-10px);
		}
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(8px);
		}
	}

	@media (max-width: 768px) {
		.hero-content {
			align-items: center;
			padding-right: 5%;
			padding-left: 5%;
		}

		.name-line {
			font-size: clamp(2rem, 10vw, 4rem);
		}

		.name-line-2,
		.name-line-3 {
			margin-left: 0;
		}

		.scroll-indicator {
			bottom: 2rem;
		}
	}
</style>
