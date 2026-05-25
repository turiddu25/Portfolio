<script>
	// @ts-nocheck
	import { onDestroy, onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { activeProjectPreview } from '$lib/stores/projectPreviewStore';

	let preview;
	let activeProject = null;
	let visible = false;
	let unsubscribe;
	let setX;
	let setY;

	onMount(() => {
		setX = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3.out' });
		setY = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3.out' });

		function handleMove(event) {
			setX(event.clientX + 28);
			setY(event.clientY - 150);
		}

		unsubscribe = activeProjectPreview.subscribe((project) => {
			activeProject = project;
			visible = Boolean(project);

			gsap.to(preview, {
				autoAlpha: visible ? 1 : 0,
				scale: visible ? 1 : 0.95,
				duration: 0.28,
				ease: 'power2.out'
			});
		});

		window.addEventListener('mousemove', handleMove, { passive: true });

		return () => {
			window.removeEventListener('mousemove', handleMove);
		};
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<div bind:this={preview} class="cursor-preview" aria-hidden="true">
	{#if activeProject}
		<img src={activeProject.previewImage || activeProject.image} alt="" />
	{/if}
</div>

<style>
	.cursor-preview {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 35;
		width: 400px;
		height: 300px;
		pointer-events: none;
		opacity: 0;
		visibility: hidden;
		transform-origin: center;
		border: 1px solid rgba(255, 255, 255, 0.24);
		background: var(--black);
		overflow: hidden;
	}

	.cursor-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (max-width: 767px), (pointer: coarse) {
		.cursor-preview {
			display: none;
		}
	}
</style>
