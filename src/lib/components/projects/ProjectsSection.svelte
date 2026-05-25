<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import ProjectList from './ProjectList.svelte';

	export let projects = [];

	let section;

	onMount(() => {
		const rows = section.querySelectorAll('.project-row');
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;

				gsap.from(rows, {
					y: 40,
					duration: 0.75,
					stagger: 0.06,
					ease: 'power3.out',
					clearProps: 'transform'
				});
				observer.disconnect();
			},
			{ threshold: 0.15 }
		);

		observer.observe(section);

		return () => observer.disconnect();
	});
</script>

<section bind:this={section} id="projects" class="projects-section">
	<div class="section-inner">
		<div class="section-heading">
			<p>My Projects</p>
		</div>

		{#if projects.length}
			<ProjectList {projects} />
		{:else}
			<p class="empty">No projects found.</p>
		{/if}
	</div>
</section>

<style>
	.projects-section {
		position: relative;
		z-index: 10;
		background: var(--black);
		padding: clamp(5rem, 10vw, 9rem) 1.5rem;
	}

	.section-inner {
		width: min(1400px, 100%);
		margin: 0 auto;
	}

	.section-heading {
		margin-bottom: clamp(3rem, 7vw, 6rem);
	}

	.section-heading p {
		color: var(--grey-soft);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.85rem;
	}

	.empty {
		color: var(--grey-soft);
		padding: 3rem 0;
	}

	@media (max-width: 767px) {
		.projects-section {
			padding: 4rem 1rem;
		}

	}
</style>
