<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import ChatFAB from '$lib/components/chat/ChatFAB.svelte';
	import { sceneReady } from '$lib/stores/sceneStore';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Prevent browser UI from hiding/showing on mobile for static experience
	onMount(() => {
		// This approach prevents the browser UI from hiding by keeping the page from
		// scrolling too fast and triggering the UI hide/show behavior
		let isScrollTimeout: ReturnType<typeof setTimeout> | undefined;
		
		const handleScroll = () => {
			// Clear any existing timeout
			if (isScrollTimeout) {
				clearTimeout(isScrollTimeout);
			}
			
			// Set a small timeout to prevent rapid scroll events that could trigger UI hiding
			isScrollTimeout = setTimeout(() => {
				// This helps maintain consistent viewport height
				document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
			}, 100);
		};

		// Set initial vh unit and add scroll listener
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
			if (isScrollTimeout) {
				clearTimeout(isScrollTimeout);
			}
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !$sceneReady}
	<div class="global-preloader">
		<span>Loading...</span>
	</div>
{/if}

{@render children?.()}
<ChatPanel />
<ChatFAB />

<style>
	.global-preloader {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: grid;
		place-items: center;
		background: var(--black);
		color: var(--white);
		font-family: var(--font-heading);
	}
</style>
