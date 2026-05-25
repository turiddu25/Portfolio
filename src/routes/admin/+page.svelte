<script lang="ts">
	import { onMount } from 'svelte';
	import { getProjects } from '$lib/sanityClient';
	import { normalizeProject, type Project } from '$lib/projects';

	let projects: Project[] = [];
	let isLoading = true;
	let error = '';

	onMount(async () => {
		try {
			const data = await getProjects();
			projects = data.map(normalizeProject);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load project entries.';
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Project Entries | Admin</title>
</svelte:head>

<main class="admin-container">
	<section class="admin-header">
		<p>Sanity Entries</p>
		<h1>Projects</h1>
	</section>

	{#if isLoading}
		<p class="state">Loading project entries...</p>
	{:else if error}
		<p class="state error">{error}</p>
	{:else}
		<div class="entries">
			{#each projects as project}
				<article class="entry">
					<div class="entry-main">
						<h2>{project.title}</h2>
						<p>{project.description}</p>
					</div>

					<div class="entry-meta">
						{#if project.year}
							<span>{project.year}</span>
						{/if}
						{#if project.role}
							<span>{project.role}</span>
						{/if}
						<span>{project.previewSvg ? 'Preview SVG' : 'No SVG'}</span>
						{#if project.accentColour}
							<span class="colour" style={`--entry-colour: ${project.accentColour}`}>
								{project.accentColour}
							</span>
						{/if}
					</div>

					{#if project.tech.length}
						<div class="tags">
							{#each project.tech as tag}
								<span>{tag}</span>
							{/each}
						</div>
					{/if}

					<div class="links">
						{#if project.liveUrl}
							<a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live</a>
						{/if}
						{#if project.githubUrl}
							<a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</main>

<style>
	.admin-container {
		min-height: 100vh;
		background: var(--black);
		color: var(--white);
		padding: clamp(2rem, 5vw, 5rem) 1.5rem;
		font-family: var(--font-body);
	}

	.admin-header,
	.entries {
		width: min(1200px, 100%);
		margin: 0 auto;
	}

	.admin-header {
		margin-bottom: 3rem;
	}

	.admin-header p {
		margin: 0 0 0.5rem;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.85rem;
	}

	h1,
	h2 {
		margin: 0;
		font-family: var(--font-heading);
	}

	h1 {
		font-size: clamp(3rem, 8vw, 7rem);
		line-height: 0.9;
	}

	.entries {
		display: grid;
		gap: 1rem;
	}

	.entry {
		border: 1px solid var(--border);
		background: rgba(255, 246, 232, 0.48);
		padding: 1.25rem;
	}

	.entry-main {
		display: grid;
		grid-template-columns: minmax(220px, 0.35fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}

	h2 {
		font-size: clamp(1.4rem, 2.5vw, 2.2rem);
		line-height: 1;
	}

	.entry-main p {
		margin: 0;
		color: var(--grey-soft);
		line-height: 1.45;
	}

	.entry-meta,
	.tags,
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: 1rem;
		color: var(--grey-soft);
		font-size: 0.85rem;
	}

	.entry-meta span,
	.tags span,
	.links a {
		color: inherit;
		text-decoration: none;
	}

	.colour::before {
		content: '';
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		margin-right: 0.35rem;
		border-radius: 50%;
		background: var(--entry-colour);
		vertical-align: -0.08rem;
	}

	.links a {
		color: var(--accent);
	}

	.state {
		width: min(1200px, 100%);
		margin: 0 auto;
		color: var(--grey-soft);
	}

	.error {
		color: #9f3f2f;
	}

	@media (max-width: 760px) {
		.entry-main {
			grid-template-columns: 1fr;
		}
	}
</style>
