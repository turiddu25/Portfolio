<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/icon.png';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import ChatFAB from '$lib/components/chat/ChatFAB.svelte';
	import ThemeLab from '$lib/components/ThemeLab.svelte';
	import { sceneReady } from '$lib/stores/sceneStore';
	import { labOpen, labRequested } from '$lib/stores/themeStore';
	import { scrollY } from '$lib/stores/scrollStore';
	import Lenis from 'lenis';

	let { children } = $props();

	let shell: HTMLDivElement;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Shift+L opens the palette/material lab anywhere on the site.
	function handleKeydown(event: KeyboardEvent) {
		if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
		if (event.key !== 'L' && event.key !== 'l') return;

		const target = event.target as HTMLElement | null;
		const typing =
			target?.tagName === 'INPUT' ||
			target?.tagName === 'TEXTAREA' ||
			target?.tagName === 'SELECT' ||
			target?.isContentEditable;
		if (typing) return;

		event.preventDefault();
		labOpen.update((open) => !open);
	}

	// ?lab=1 is read after mount so SSR and the first client render agree.
	onMount(() => {
		if (labRequested) labOpen.set(true);
	});

	// Lenis drives `.scroll-shell`, not the window — the document never scrolls.
	onMount(() => {
		const lenis = new Lenis({
			wrapper: shell,
			content: shell.firstElementChild as HTMLElement,
			duration: 1.8,
			easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 2
		});

		let rafId = 0;
		let paused = false;

		function raf(time: number) {
			if (paused) return;
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		}

		rafId = requestAnimationFrame(raf);

		lenis.on('scroll', ({ scroll }: { scroll: number }) => scrollY.set(scroll));
		// Safety net: if smooth scrolling is ever bypassed, the shell still reports.
		const onNativeScroll = () => scrollY.set(shell.scrollTop);
		shell.addEventListener('scroll', onNativeScroll, { passive: true });

		function handleVisibilityChange() {
			paused = document.hidden;
			if (!paused) rafId = requestAnimationFrame(raf);
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.lenis = lenis;

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			shell.removeEventListener('scroll', onNativeScroll);
			cancelAnimationFrame(rafId);
			lenis.destroy();
			delete window.lenis;
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !$sceneReady}
	<div class="global-preloader">
		<span>Loading...</span>
	</div>
{/if}

<div class="scroll-shell" bind:this={shell}>
	<div>
		{@render children?.()}
	</div>
</div>
<ChatPanel />
<ChatFAB />
{#if $labOpen}
	<ThemeLab />
{/if}

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
