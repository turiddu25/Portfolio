<script>
	// @ts-nocheck
	import ProjectCard from './ProjectCard.svelte';

	export let projects = [];

	let openProjectId = null;

	$: visibleProjects = projects.filter((project) => project.previewSvg);

	function toggleProject(project) {
		openProjectId = openProjectId === project._id ? null : project._id;
	}
</script>

{#if visibleProjects.length}
	<div class="project-grid">
		{#each visibleProjects as project}
			<ProjectCard
				{project}
				isOpen={openProjectId === project._id}
				on:toggle={() => toggleProject(project)}
			/>
		{/each}
	</div>
{:else}
	<p class="empty">Add Preview SVGs in Sanity to show projects here.</p>
{/if}

<style>
	.project-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem);
	}

	.empty {
		color: var(--grey-soft);
		padding: 3rem 0;
	}

	@media (max-width: 1024px) {
		.project-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 680px) {
		.project-grid {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}
</style>
