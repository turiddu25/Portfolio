<script>
	export let project;
	export let className = '';
</script>

<div class="project-visual {className}">
	{#if project.previewSvg}
		{@html project.previewSvg}
	{/if}
</div>

<style>
	.project-visual {
		width: 100%;
		height: 100%;
		background: var(--surface);
		overflow: hidden;
	}

	.project-visual :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	.project-visual :global(svg) {
		background: var(--surface);
	}

	.project-visual :global(svg rect) {
		fill: var(--surface);
	}

	.project-visual :global(svg path),
	.project-visual :global(svg circle),
	.project-visual :global(svg line),
	.project-visual :global(svg polyline),
	.project-visual :global(svg polygon) {
		stroke: var(--white);
	}
</style>
