<script>
	import { createEventDispatcher } from 'svelte';
	import ProjectVisual from './ProjectVisual.svelte';

	export let project;
	export let index = 0;
	export let isOpen = false;

	const dispatch = createEventDispatcher();

	$: displayIndex = String(index + 1).padStart(2, '0');
	$: tags = project.tech.slice(0, 4);
	$: panelId = `project-panel-${project._id}`;

	function toggle() {
		dispatch('toggle');
	}
</script>

<article class="project-row" class:open={isOpen}>
	<button
		class="row-button"
		type="button"
		aria-expanded={isOpen}
		aria-controls={panelId}
		on:click={toggle}
	>
		<span class="index">{displayIndex}</span>
		<span class="title-wrap">
			<span class="title">{project.title}</span>
			<span class="mobile-meta">{project.year || 'Now'}</span>
		</span>

		{#if project.previewSvg}
			<span class="visual-wrap" aria-hidden="true">
				<ProjectVisual {project} />
			</span>
		{/if}

		<span class="meta">
			<span class="year">{project.year || 'Now'}</span>
			<span class="tags">
				{#each tags as tag}
					<span>{tag}</span>
				{/each}
			</span>
		</span>
		<span class="toggle-mark" aria-hidden="true">{isOpen ? '−' : '+'}</span>
	</button>

	<div id={panelId} class="panel" aria-hidden={!isOpen}>
		<div class="panel-inner">
			<p>{project.description}</p>
			<div class="panel-footer">
				{#if project.tech.length}
					<div class="panel-tags" aria-label="Technologies">
						{#each project.tech as tag}
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
								<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5.1 5.1 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7A3.4 3.4 0 0 0 9 18.1V22" />
							</svg>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	.project-row {
		border-bottom: 1px solid var(--border);
	}

	.row-button {
		width: 100%;
		min-height: 150px;
		display: grid;
		grid-template-columns: 4rem minmax(0, 1fr) minmax(180px, 260px) minmax(220px, 0.35fr) 3rem;
		align-items: center;
		gap: 1.5rem;
		border: 0;
		background: transparent;
		color: var(--white);
		text-align: left;
		cursor: pointer;
		padding: 1.25rem 0;
	}

	.index,
	.mobile-meta {
		color: var(--grey-soft);
		font-size: 0.85rem;
	}

	.title-wrap {
		min-width: 0;
	}

	.title {
		display: block;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(2.3rem, 4.5vw, 4.7rem);
		line-height: 1;
	}

	.mobile-meta {
		display: none;
		margin-top: 0.5rem;
	}

	.visual-wrap {
		width: 100%;
		aspect-ratio: 4 / 3;
		border: 1px solid var(--border);
		background: var(--surface);
		overflow: hidden;
		display: block;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
		color: var(--grey-soft);
		font-size: 0.85rem;
	}

	.tags,
	.panel-tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.4rem;
	}

	.tags span,
	.panel-tags span {
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.25rem 0.55rem;
		color: var(--white);
	}

	.toggle-mark {
		justify-self: end;
		font-family: var(--font-heading);
		font-size: 2.4rem;
		line-height: 1;
	}

	.panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.42s var(--ease);
	}

	.project-row.open .panel {
		grid-template-rows: 1fr;
	}

	.panel-inner {
		overflow: hidden;
		padding-left: 4rem;
	}

	.panel-inner p {
		max-width: 760px;
		padding: 0 0 2rem;
		color: var(--grey-soft);
		font-size: clamp(1.1rem, 1.8vw, 1.55rem);
		line-height: 1.45;
	}

	.panel-footer {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		padding: 0 0 2rem;
	}

	.panel-tags {
		justify-content: flex-start;
	}

	.links {
		display: flex;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.links a {
		width: 46px;
		height: 46px;
		display: grid;
		place-items: center;
		border: 1px solid var(--border-strong);
		border-radius: 50%;
		color: var(--white);
		text-decoration: none;
	}

	.links svg {
		width: 22px;
		height: 22px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	@media (max-width: 1024px) {
		.row-button {
			grid-template-columns: 3rem minmax(0, 1fr) minmax(140px, 200px) 2rem;
		}

		.meta {
			display: none;
		}
	}

	@media (max-width: 767px) {
		.row-button {
			min-height: 0;
			grid-template-columns: minmax(0, 1fr) 2rem;
			gap: 1rem;
			padding: 1.4rem 0;
		}

		.index,
		.meta {
			display: none;
		}

		.title {
			font-size: clamp(1.9rem, 9vw, 3rem);
		}

		.mobile-meta {
			display: block;
		}

		.visual-wrap {
			grid-column: 1 / -1;
			max-width: 360px;
		}

		.panel-inner {
			padding-left: 0;
		}

		.panel-footer {
			flex-direction: column;
			gap: 1.25rem;
		}
	}
</style>
