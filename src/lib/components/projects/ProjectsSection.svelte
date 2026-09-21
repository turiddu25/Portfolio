<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import ProjectList from './ProjectList.svelte';

	export let projects = [];
	export let cmsError = '';

	let section;

	onMount(() => {
		const cards = section.querySelectorAll('.project-card');
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;

				gsap.from(cards, {
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
		{:else if cmsError}
			<p class="empty">
				Couldn't load projects from the CMS.
				<span class="reason">{cmsError}</span>
			</p>
		{:else}
			<p class="empty">No projects found.</p>
		{/if}
	</div>
</section>

<style>
	.projects-section {
		position: relative;
		z-index: 10;
		background: transparent;
		padding: clamp(3.5rem, 7vw, 6rem) 1.5rem clamp(4rem, 8vw, 7rem);
	}

	.section-inner {
		width: min(1400px, 100%);
		margin: 0 auto;
	}

	.section-heading {
		margin-bottom: clamp(3rem, 7vw, 6rem);
	}

	.section-heading p {
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.85rem;
	}

	.empty {
		color: var(--grey-soft);
		padding: 3rem 0;
	}

	.reason {
		display: block;
		margin-top: 0.4rem;
		font-family: monospace;
		font-size: 0.8rem;
		opacity: 0.65;
	}

	@media (max-width: 767px) {
		.projects-section {
			padding: 4rem 1rem;
		}
	}
</style>
