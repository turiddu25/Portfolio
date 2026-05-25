<script>
	// @ts-nocheck
	import ProjectRow from './ProjectRow.svelte';

	export let projects = [];

	let openProjectId = null;

	function toggleProject(project) {
		openProjectId = openProjectId === project._id ? null : project._id;
	}
</script>

<div class="project-list">
	{#each projects as project, index}
		<ProjectRow
			{project}
			{index}
			isOpen={openProjectId === project._id}
			on:toggle={() => toggleProject(project)}
		/>
	{/each}
</div>

<style>
	.project-list {
		border-top: 1px solid var(--border);
	}
</style>
