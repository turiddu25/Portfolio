<script>
	import ProjectModal from './ProjectModal.svelte';

	export let projects = [];

	let selectedProject = null;

	function openProject(project) {
		selectedProject = project;
	}

	function closeModal() {
		selectedProject = null;
	}
</script>

{#if projects.length === 0}
	<div class="loading-state">
		<p>No projects found.</p>
	</div>
{:else}
	<div class="project-grid">
		{#each projects as project, i}
			<button
				class="project-card"
				style="animation-delay: {i * 0.1}s"
				on:click={() => openProject(project)}
			>
				<div class="card-image">
					<img
						src={project.image}
						srcset={project.imageSrcset || ''}
						sizes="(max-width: 768px) 100vw, 50vw"
						alt={project.title}
						loading="lazy"
					/>
				</div>
				<div class="card-overlay">
					<h3>{project.title}</h3>
					<p>{project.description}</p>
				</div>
			</button>
		{/each}
	</div>
{/if}

{#if selectedProject}
	<ProjectModal project={selectedProject} on:close={closeModal} />
{/if}

<style>
	.project-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		overflow: hidden;
	}

	.project-card {
		position: relative;
		aspect-ratio: 4/3;
		background: var(--black);
		border: 1px solid var(--white);
		border-radius: 16px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.4s var(--ease);
		opacity: 0;
		transform: translateX(50px);
		animation: fadeInRight 0.8s var(--ease) forwards;
	}

	.project-card:hover {
		transform: translateY(-8px) translateX(0);
		box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
	}

	.card-image {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.card-image::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0);
		transition: background 0.4s var(--ease);
		pointer-events: none;
	}

	.project-card:hover .card-image::after {
		background: rgba(0, 0, 0, 0.3);
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s var(--ease);
	}

	.project-card:hover .card-image img {
		transform: scale(1.1);
	}

	.card-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1.5rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
		transform: translateY(100%);
		transition: transform 0.4s var(--ease);
	}

	.project-card:hover .card-overlay {
		transform: translateY(0);
	}

	.card-overlay h3 {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
		color: var(--white);
	}

	.card-overlay p {
		font-size: 0.9rem;
		color: var(--grey-soft);
		line-height: 1.4;
	}

	.loading-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--grey-soft);
		font-family: var(--font-heading);
		font-size: 1.1rem;
	}

	@media (max-width: 768px) {
		.project-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
