<script>
	import { activeProjectPreview } from '$lib/stores/projectPreviewStore';

	export let project;
	export let index = 0;
	export let isDimmed = false;

	$: displayIndex = String(index + 1).padStart(2, '0');
	$: tags = project.tech.slice(0, 3);
</script>

<a
	class="project-row"
	class:dimmed={isDimmed}
	href="/projects/{project.slug}"
	on:mouseenter={() => activeProjectPreview.set(project)}
	on:focus={() => activeProjectPreview.set(project)}
	on:mouseleave={() => activeProjectPreview.set(null)}
	on:blur={() => activeProjectPreview.set(null)}
>
	<img class="mobile-thumb" src={project.image} srcset={project.imageSrcset} alt={project.title} />

	<span class="index">{displayIndex}</span>
	<span class="title">{project.title}</span>
	<span class="meta">
		<span class="year">{project.year || 'Now'}</span>
		<span class="tags">
			{#each tags as tag}
				<span>{tag}</span>
			{/each}
		</span>
	</span>
	<span class="arrow">→</span>
</a>

<style>
	.project-row {
		position: relative;
		display: grid;
		grid-template-columns: 4rem minmax(0, 1fr) minmax(220px, 0.35fr) 3rem;
		align-items: center;
		min-height: 136px;
		color: var(--white);
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		opacity: 1;
		transition:
			opacity 0.3s var(--ease),
			color 0.3s var(--ease);
	}

	.project-row::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		width: 0;
		height: 1px;
		background: var(--white);
		transition: width 0.45s var(--ease);
	}

	.project-row:hover::after,
	.project-row:focus-visible::after {
		width: 100%;
	}

	.project-row.dimmed {
		opacity: 0.3;
	}

	.index {
		color: var(--grey-soft);
		font-family: var(--font-body);
		font-size: 0.85rem;
	}

	.title {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(2.5rem, 5vw, 5rem);
		line-height: 1;
		transition: transform 0.35s var(--ease);
	}

	.project-row:hover .title,
	.project-row:focus-visible .title {
		transform: translateX(-20px);
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem;
		color: var(--grey-soft);
		font-size: 0.85rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.4rem;
	}

	.tags span {
		border: 1px solid rgba(255, 255, 255, 0.22);
		border-radius: 999px;
		padding: 0.25rem 0.55rem;
		color: var(--white);
	}

	.arrow {
		opacity: 0;
		transform: translateX(-12px);
		justify-self: end;
		font-size: 2rem;
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease);
	}

	.project-row:hover .arrow,
	.project-row:focus-visible .arrow {
		opacity: 1;
		transform: translateX(0);
	}

	.mobile-thumb {
		display: none;
	}

	@media (max-width: 767px) {
		.project-row {
			grid-template-columns: 96px minmax(0, 1fr);
			gap: 1rem;
			min-height: 0;
			padding: 1.1rem 0;
		}

		.mobile-thumb {
			display: block;
			width: 96px;
			aspect-ratio: 4 / 3;
			object-fit: cover;
			border: 1px solid rgba(255, 255, 255, 0.18);
			grid-row: span 3;
		}

		.index {
			display: none;
		}

		.title {
			font-size: clamp(1.5rem, 8vw, 2.4rem);
			transform: none !important;
		}

		.meta {
			justify-content: flex-start;
			align-items: flex-start;
			flex-direction: column;
			gap: 0.6rem;
		}

		.arrow {
			display: none;
		}
	}
</style>
