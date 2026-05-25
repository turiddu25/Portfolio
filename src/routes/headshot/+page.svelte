<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	let canvas;
	let renderer;
	let frameId;
	let isDragging = false;
	let lastX = 0;
	let rotationOffset = 0;

	onMount(async () => {
		const THREE = await import('three');
		const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
		const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
		const { RGBELoader } = await import('three/addons/loaders/RGBELoader.js');

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(42, 1200 / 630, 0.1, 1000);
		camera.position.set(0, 0, 5);

		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setSize(1200, 630, false);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		scene.add(new THREE.AmbientLight(0xffffff, 0.85));

		const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
		keyLight.position.set(4, 5, 5);
		scene.add(keyLight);

		const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
		rimLight.position.set(-4, 3, -4);
		scene.add(rimLight);

		const rgbeLoader = new RGBELoader();
		rgbeLoader.load('/studio_small_03_1k.hdr', (texture) => {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			scene.environment = texture;
		});

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		let head;
		loader.load('/head33.glb', (gltf) => {
			head = gltf.scene;
			head.traverse((child) => {
				if (child.isMesh) {
					child.material = new THREE.MeshStandardMaterial({
						color: 0xb07a3f,
						roughness: 0.24,
						metalness: 1
					});
				}
			});

			head.scale.setScalar(2.9);
			head.rotation.set(0, Math.PI, 0);
			head.position.set(-1.25, -0.08, 0);
			scene.add(head);
		});

		function resize() {
			camera.aspect = 1200 / 630;
			camera.updateProjectionMatrix();
			renderer.setSize(1200, 630, false);
		}

		function pointerDown(event) {
			isDragging = true;
			lastX = event.clientX;
		}

		function pointerMove(event) {
			if (!isDragging) return;
			const delta = event.clientX - lastX;
			lastX = event.clientX;
			rotationOffset += delta * 0.01;
		}

		function pointerUp() {
			isDragging = false;
		}

		function animate() {
			frameId = requestAnimationFrame(animate);
			if (head) {
				const time = Date.now() * 0.001;
				head.rotation.y = Math.PI + rotationOffset + Math.sin(time * 0.35) * 0.02;
				head.position.y = -0.08 + Math.sin(time * 0.45) * 0.035;
			}
			renderer.render(scene, camera);
		}

		window.addEventListener('resize', resize);
		window.addEventListener('pointermove', pointerMove);
		window.addEventListener('pointerup', pointerUp);
		window.addEventListener('pointercancel', pointerUp);
		canvas.addEventListener('pointerdown', pointerDown);
		animate();

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', pointerMove);
			window.removeEventListener('pointerup', pointerUp);
			window.removeEventListener('pointercancel', pointerUp);
			canvas.removeEventListener('pointerdown', pointerDown);
			cancelAnimationFrame(frameId);
			if (renderer) renderer.dispose();
			dracoLoader.dispose();
		};
	});
</script>

<svelte:head>
	<title>Headshot Render</title>
</svelte:head>

<main>
	<section class="og-card">
		<canvas bind:this={canvas}></canvas>
		<div class="name-block">
			<p>Portfolio</p>
			<h1>
				<span>Colin</span>
				<span>Salvatore</span>
				<span>Nardo</span>
			</h1>
		</div>
	</section>
</main>

<style>
	main {
		width: 100vw;
		height: 100vh;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: #2a211a;
	}

	.og-card {
		position: relative;
		width: min(100vw, calc(100vh * 1200 / 630));
		aspect-ratio: 1200 / 630;
		overflow: hidden;
		background:
			radial-gradient(circle at 28% 42%, rgba(255, 246, 232, 0.98) 0%, rgba(242, 230, 212, 0.96) 42%, rgba(220, 198, 170, 0.92) 100%);
	}

	.og-card::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 20% 30%, rgba(74, 52, 38, 0.055) 0 1px, transparent 1px),
			radial-gradient(circle at 70% 60%, rgba(74, 52, 38, 0.04) 0 1px, transparent 1px);
		background-size: 18px 18px, 23px 23px;
		opacity: 0.18;
	}

	canvas {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		cursor: grab;
		touch-action: none;
	}

	canvas:active {
		cursor: grabbing;
	}

	.name-block {
		position: absolute;
		right: 82px;
		top: 50%;
		transform: translateY(-50%);
		width: 520px;
		pointer-events: none;
	}

	.name-block p {
		margin: 0 0 18px;
		color: var(--accent);
		font-family: var(--font-body);
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	h1 {
		margin: 0;
		color: var(--white);
		font-family: var(--font-heading);
		font-size: 92px;
		line-height: 0.9;
		letter-spacing: 0;
	}

	h1 span {
		display: block;
	}

	h1 span:nth-child(2) {
		color: var(--accent);
		font-style: italic;
		margin-left: 36px;
	}
</style>
