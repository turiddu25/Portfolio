<script>
	// @ts-nocheck
	import ProjectRow from './ProjectRow.svelte';
	import CursorPreview from './CursorPreview.svelte';
	import { activeProjectPreview } from '$lib/stores/projectPreviewStore';
	import { onDestroy } from 'svelte';

	export let projects = [];

	let activeProject = null;

	const unsubscribe = activeProjectPreview.subscribe((project) => {
		activeProject = project;
	});

	onDestroy(unsubscribe);
</script>

<div class="project-list" role="presentation" on:mouseleave={() => activeProjectPreview.set(null)}>
	{#each projects as project, index}
		<ProjectRow
			{project}
			{index}
			isDimmed={activeProject && activeProject._id !== project._id}
		/>
	{/each}
</div>

<CursorPreview />

<style>
	.project-list {
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
