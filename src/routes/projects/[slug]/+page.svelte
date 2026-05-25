<script>
	import { goto } from '$app/navigation';

	export let data;

	$: project = data.project;
	$: nextProject = data.nextProject;

	function backToWork() {
		goto('/#projects');
	}
</script>

<svelte:head>
	<title>{project.title} — Colin Salvatore Nardo</title>
	<meta name="description" content={project.description} />
</svelte:head>

<main class="project-page">
	<button class="back-button" on:click={backToWork} aria-label="Back to all work">← All work</button>

	<section class="project-hero">
		{#if project.heroImage}
			<img
				src={project.heroImage}
				srcset={project.imageSrcset}
				sizes="100vw"
				alt={project.title}
				class="hero-image"
			/>
		{/if}
		<div class="hero-shade"></div>
		<div class="hero-copy">
			<p>{project.year || 'Selected work'}</p>
			<h1>{project.title}</h1>
		</div>
	</section>

	<section class="project-body">
		<div class="description">
			<p>{project.details}</p>
		</div>

		<aside class="meta">
			{#if project.role}
				<div>
					<span>Role</span>
					<p>{project.role}</p>
				</div>
			{/if}
			{#if project.year}
				<div>
					<span>Year</span>
					<p>{project.year}</p>
				</div>
			{/if}
			{#if project.tech.length}
				<div>
					<span>Stack</span>
					<div class="tags">
						{#each project.tech as item}
							<span class="tag">{item}</span>
						{/each}
					</div>
				</div>
			{/if}
			<div class="links">
				{#if project.liveUrl}
					<a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live site</a>
				{/if}
				{#if project.githubUrl}
					<a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
				{/if}
			</div>
		</aside>
	</section>

	{#if project.gallery.length}
		<section class="gallery" aria-label="{project.title} gallery">
			{#each project.gallery as image, index}
				<img src={image} alt="{project.title} screenshot {index + 1}" loading="lazy" />
			{/each}
		</section>
	{/if}

	{#if nextProject}
		<a class="next-project" href="/projects/{nextProject.slug}">
			<span>Next project</span>
			<strong>{nextProject.title}</strong>
		</a>
	{/if}
</main>

<style>
	.project-page {
		min-height: 100vh;
		background: var(--black);
		color: var(--white);
	}

	.back-button {
		position: fixed;
		top: 1.5rem;
		left: 1.5rem;
		z-index: 20;
		border: 1px solid rgba(255, 255, 255, 0.35);
		background: rgba(0, 0, 0, 0.65);
		color: var(--white);
		border-radius: 999px;
		padding: 0.75rem 1rem;
		font-family: var(--font-heading);
		cursor: pointer;
		backdrop-filter: blur(10px);
	}

	.project-hero {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: flex-end;
		overflow: hidden;
	}

	.hero-image,
	.hero-shade {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.hero-image {
		object-fit: cover;
		opacity: 0.72;
	}

	.hero-shade {
		background: linear-gradient(to top, rgba(0, 0, 0, 0.92), transparent 65%);
	}

	.hero-copy {
		position: relative;
		z-index: 1;
		width: min(1200px, calc(100% - 3rem));
		margin: 0 auto;
		padding: 8rem 0 4rem;
	}

	.hero-copy p {
		color: var(--grey-soft);
		font-family: var(--font-heading);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 1rem;
	}

	.hero-copy h1 {
		font-size: clamp(3.25rem, 11vw, 10rem);
		line-height: 0.92;
		max-width: 11ch;
	}

	.project-body {
		width: min(1200px, calc(100% - 3rem));
		margin: 0 auto;
		padding: 5rem 0;
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.5fr);
		gap: 5rem;
	}

	.description {
		font-size: clamp(1.25rem, 2vw, 2rem);
		line-height: 1.45;
		color: rgba(255, 255, 255, 0.86);
		white-space: pre-line;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		position: sticky;
		top: 6rem;
		align-self: start;
	}

	.meta span {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--grey-soft);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.meta p {
		font-family: var(--font-heading);
		font-size: 1.1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		border: 1px solid rgba(255, 255, 255, 0.32);
		border-radius: 999px;
		padding: 0.4rem 0.7rem;
		color: var(--white) !important;
		margin: 0 !important;
		letter-spacing: 0 !important;
		text-transform: none !important;
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.links a {
		color: var(--white);
		font-family: var(--font-heading);
		text-decoration: none;
		border-bottom: 1px solid currentColor;
		width: fit-content;
	}

	.gallery {
		width: min(1200px, calc(100% - 3rem));
		margin: 0 auto;
		display: grid;
		gap: 1rem;
		padding-bottom: 5rem;
	}

	.gallery img {
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		border: 1px solid rgba(255, 255, 255, 0.16);
	}

	.next-project {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		padding: 3rem max(1.5rem, calc((100vw - 1200px) / 2));
		border-top: 1px solid rgba(255, 255, 255, 0.24);
		color: var(--white);
		text-decoration: none;
	}

	.next-project span {
		color: var(--grey-soft);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.8rem;
	}

	.next-project strong {
		font-family: var(--font-heading);
		font-size: clamp(2rem, 5vw, 5rem);
		line-height: 1;
		text-align: right;
	}

	@media (max-width: 768px) {
		.back-button {
			top: 1rem;
			left: 1rem;
		}

		.project-hero {
			min-height: 70vh;
		}

		.project-body {
			grid-template-columns: 1fr;
			gap: 3rem;
			padding: 3rem 0;
		}

		.meta {
			position: static;
		}

		.next-project {
			align-items: flex-start;
			flex-direction: column;
		}

		.next-project strong {
			text-align: left;
		}
	}
</style>
