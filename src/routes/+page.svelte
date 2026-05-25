<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectsSection from '$lib/components/projects/ProjectsSection.svelte';
	import About from '$lib/components/About.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Lenis from 'lenis';

	export let data;

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

		let lenisRafId;
		let lenisPaused = false;

		function raf(time) {
			if (lenisPaused) return;
			lenis.raf(time);
			lenisRafId = requestAnimationFrame(raf);
		}

		lenisRafId = requestAnimationFrame(raf);

		function handleVisibilityChange() {
			lenisPaused = document.hidden;
			if (!lenisPaused) lenisRafId = requestAnimationFrame(raf);
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Make lenis available to child components
		window.lenis = lenis;

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			cancelAnimationFrame(lenisRafId);
			lenis.destroy();
			delete window.lenis;
		};
	});
</script>

<svelte:head>
	<title>Colin Salvatore Nardo</title>
	<meta name="description" content="My personal portfolio." />
	<meta property="og:title" content="Colin Salvatore Nardo" />
	<meta property="og:description" content="My personal portfolio." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nardocol.in/" />
	<meta property="og:image" content="https://nardocol.in/banner.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Colin Salvatore Nardo portfolio preview" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Colin Salvatore Nardo" />
	<meta name="twitter:description" content="My personal portfolio." />
	<meta name="twitter:image" content="https://nardocol.in/banner.png" />
</svelte:head>

<main>
	<Hero />
	<ProjectsSection projects={data.projects} />
	<About />
	<Footer />
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
	}
</style>
