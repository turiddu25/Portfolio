<script>
	// @ts-nocheck
	import Hero from '$lib/components/Hero.svelte';
	import ProjectsSection from '$lib/components/projects/ProjectsSection.svelte';
	import About from '$lib/components/About.svelte';
	import Footer from '$lib/components/Footer.svelte';

	export let data;
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
	<About />
	<ProjectsSection projects={data.projects} cmsReachable={data.cmsReachable} />
	<Footer />
</main>

<style>
	main {
		width: 100%;
		min-height: 100%;
	}
</style>
