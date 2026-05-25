<script>
	import { createEventDispatcher } from 'svelte';
	import ProjectVisual from './ProjectVisual.svelte';

	export let project;
	export let isOpen = false;

	const dispatch = createEventDispatcher();

	$: accent = project.accentColour || 'var(--accent)';
	$: tags = project.tech.slice(0, 2);
	$: panelId = `project-card-panel-${project._id}`;
	$: allTags = project.tech || [];

	function toggle() {
		dispatch('toggle');
	}
</script>

<article
	class="project-card"
	class:open={isOpen}
	style={`--project-accent: ${accent}`}
>
	<button
		class="card-button"
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		on:click={toggle}
	>
		<div class="visual-tile">
			<ProjectVisual {project} className="card-visual" muted />
			<span class="view-label">{isOpen ? 'Close' : 'View'}</span>
		</div>

		<div class="project-meta">
			<h3>{project.title}</h3>
			<div class="meta-line">
				{#if project.year}
					<span>{project.year}</span>
				{/if}
				{#if tags.length}
					<span>{tags.join(' / ')}</span>
				{/if}
			</div>
		</div>
	</button>

	<div id={panelId} class="card-panel" aria-hidden={!isOpen}>
		<div class="panel-inner">
			<p>{project.description}</p>

			<div class="panel-footer">
				{#if allTags.length}
					<div class="panel-tags" aria-label="Technologies">
						{#each allTags as tag}
							<span>{tag}</span>
						{/each}
					</div>
				{/if}

				<div class="links" aria-label="Project links">
					{#if project.liveUrl}
						<a href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Open live project">
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M7 17L17 7M9 7h8v8" />
							</svg>
						</a>
					{/if}
					{#if project.githubUrl}
						<a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Open GitHub repository">
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5.1 5.1 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8V22" />
							</svg>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	.project-card {
		display: block;
		color: var(--grey-soft);
	}

	.card-button {
		display: block;
		width: 100%;
		border: 0;
		background: transparent;
		color: inherit;
		text-align: left;
		padding: 0;
		cursor: pointer;
	}

	.visual-tile {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border: 1px solid rgba(255, 246, 232, 0.1);
		background: #1a1815;
		transition:
			border-color 0.35s var(--ease),
			transform 0.35s var(--ease),
			box-shadow 0.35s var(--ease);
	}

	.view-label {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		padding: 0.45rem 0.7rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		background: rgba(26, 24, 21, 0.78);
		color: var(--project-accent);
		font-size: 0.75rem;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease);
	}

	.project-meta {
		padding-top: 1.1rem;
	}

	h3 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: clamp(1.75rem, 3vw, 3rem);
		line-height: 1;
		color: var(--white);
		transition: color 0.3s var(--ease);
	}

	.meta-line {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 0.65rem;
		color: var(--grey-soft);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.project-card:hover,
	.card-button:focus-visible,
	.project-card.open {
		color: var(--project-accent);
	}

	.project-card:hover .visual-tile,
	.card-button:focus-visible .visual-tile,
	.project-card.open .visual-tile {
		border-color: var(--project-accent);
		transform: translateY(-4px);
		box-shadow: 0 18px 42px rgba(74, 52, 38, 0.2);
	}

	.project-card:hover .view-label,
	.card-button:focus-visible .view-label,
	.project-card.open .view-label {
		opacity: 1;
		transform: translateY(0);
	}

	.project-card:hover h3,
	.card-button:focus-visible h3,
	.project-card.open h3 {
		color: var(--project-accent);
	}

	.card-panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.38s var(--ease);
	}

	.project-card.open .card-panel {
		grid-template-rows: 1fr;
	}

	.panel-inner {
		overflow: hidden;
	}

	.panel-inner p {
		margin: 1rem 0 0;
		color: var(--white);
		font-size: 1rem;
		line-height: 1.45;
	}

	.panel-footer {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
		padding-bottom: 0.35rem;
	}

	.panel-tags,
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.panel-tags span,
	.links a {
		color: var(--white);
		font-size: 0.8rem;
		text-decoration: none;
	}

	.panel-tags span {
		color: var(--grey-soft);
		padding: 0;
	}

	.links {
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.links a:hover {
		background: var(--project-accent);
		color: var(--black);
	}

	.links a {
		width: 38px;
		height: 38px;
		display: grid;
		place-items: center;
		border: 1px solid color-mix(in srgb, var(--project-accent) 38%, var(--border));
		border-radius: 999px;
		padding: 0;
		flex: 0 0 auto;
	}

	.links svg {
		width: 19px;
		height: 19px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (max-width: 680px) {
		.panel-footer {
			flex-direction: column;
		}

		.links {
			justify-content: flex-start;
		}
	}
</style>
