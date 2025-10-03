<script>
	import { onMount, setContext } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ChatProjects from '$lib/components/ChatProjects.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Lenis from 'lenis';

	let lenis;

	onMount(() => {
		// Initialize Lenis smooth scroll
		lenis = new Lenis({
			duration: 1.8,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			orientation: 'vertical',
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 2
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		// Make lenis available to child components
		window.lenis = lenis;

		return () => {
			lenis.destroy();
			delete window.lenis;
		};
	});
</script>

<main>
	<Hero />
	<ChatProjects />
	<Footer />
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
	}
</style>
