<script>
	export let project;
	export let className = '';
	export let muted = false;
</script>

<div
	class="project-visual {className}"
	class:muted
	style={`--project-accent: ${project.accentColour || 'var(--accent)'}`}
>
	{#if project.previewSvg}
		{@html project.previewSvg}
	{/if}
</div>

<style>
	.project-visual {
		width: 100%;
		height: 100%;
		background: var(--tile);
		color: var(--project-accent);
		overflow: hidden;
	}

	.project-visual.muted {
		color: var(--tile-ink);
		transition: color 0.35s var(--ease);
	}

	:global(.project-card:hover) .project-visual.muted,
	:global(.project-card:focus-visible) .project-visual.muted {
		color: var(--project-accent);
	}

	.project-visual :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	.project-visual :global(svg) {
		background: var(--tile);
	}

	.project-visual :global(svg rect:not([fill="none"])) {
		fill: var(--tile);
	}

	.project-visual :global(svg [stroke]:not([stroke="none"])) {
		stroke: currentColor;
		stroke-width: 2;
		vector-effect: non-scaling-stroke;
	}

	.project-visual :global(svg text) {
		display: none;
	}
</style>
