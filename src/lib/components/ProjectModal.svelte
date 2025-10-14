<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let project;

	const dispatch = createEventDispatcher();
	let modalContainer;

	function closeModal() {
		dispatch('close');
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			closeModal();
		}
	}

	// Prevent body scroll when modal is open
	onMount(() => {
		// Stop Lenis smooth scroll library
		if (window.lenis) {
			window.lenis.stop();
		}
		document.body.style.overflow = 'hidden';

		// Portal the modal to body to escape parent transforms
		if (modalContainer) {
			document.body.appendChild(modalContainer);
		}
	});

	onDestroy(() => {
		// Re-enable Lenis smooth scrolling
		if (window.lenis) {
			window.lenis.start();
		}
		document.body.style.overflow = '';

		// Clean up the portaled element
		if (modalContainer && modalContainer.parentNode) {
			modalContainer.parentNode.removeChild(modalContainer);
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-backdrop" bind:this={modalContainer} transition:fade={{ duration: 300 }} on:click={closeModal} role="dialog" aria-modal="true">
	<div class="modal-content" on:click|stopPropagation>
		<button class="close-button" on:click={closeModal}>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M18 6L6 18M6 6l12 12"/>
			</svg>
		</button>

		<div class="modal-image">
			<img src={project.image} alt={project.title} />
		</div>

		<div class="modal-body">
			<h2>{project.title}</h2>
			<p class="description">{project.details}</p>

			<div class="tech-stack">
				<h3>Technologies</h3>
				<div class="tech-tags">
					{#each project.tech as tech}
						<span class="tech-tag">{tech}</span>
					{/each}
				</div>
			</div>

			<div class="modal-actions">
				{#if project.githubUrl}
					<a href={project.githubUrl} target="_blank" rel="noopener noreferrer" class="action-button">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
						</svg>
						View Code
					</a>
				{/if}
				{#if project.liveUrl}
					<a href={project.liveUrl} target="_blank" rel="noopener noreferrer" class="action-button primary">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
						</svg>
						Live Demo
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(8px);
		z-index: 1000;
	}

	.modal-content {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		max-width: 900px;
		max-height: 100%;
		background: var(--black);
		border: 2px solid var(--white);
		border-radius: 24px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		margin: auto;
		z-index: 1001;
	}

	.close-button {
		position: sticky;
		top: 1rem;
		right: 1rem;
		width: 48px;
		height: 48px;
		background: rgba(0, 0, 0, 0.8);
		border: 1px solid var(--white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--white);
		transition: all 0.3s var(--ease);
		z-index: 1002;
		align-self: flex-end;
		margin-top: 1rem;
		margin-right: 1rem;
	}

	.close-button:hover {
		background: var(--white);
		color: var(--black);
		transform: rotate(90deg);
	}

	.modal-image {
		width: 100%;
		height: 250px;
		overflow: hidden;
		border-bottom: 1px solid var(--white);
		position: relative;
		flex-shrink: 0;
	}

	.modal-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-body {
		padding: 2.5rem;
		overflow-y: auto;
		flex-grow: 1;
		-webkit-overflow-scrolling: touch;
		scroll-behavior: smooth;
	}

	.modal-body::-webkit-scrollbar {
		width: 8px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	.modal-body h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--white);
	}

	.description {
		font-size: 1.1rem;
		line-height: 1.8;
		color: var(--grey-soft);
		margin-bottom: 2rem;
	}

	.tech-stack h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--white);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tech-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.tech-tag {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid var(--white);
		border-radius: 20px;
		font-size: 0.9rem;
		color: var(--white);
		font-family: var(--font-heading);
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
	}

	.action-button {
		flex: 1;
		padding: 1rem 1.5rem;
		background: transparent;
		border: 2px solid var(--white);
		border-radius: 12px;
		color: var(--white);
		font-family: var(--font-heading);
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.3s var(--ease);
		text-decoration: none;
	}

	.action-button:hover {
		background: var(--white);
		color: var(--black);
		transform: translateY(-2px);
	}

	.action-button.primary {
		background: var(--white);
		color: var(--black);
	}

	.action-button.primary:hover {
		background: transparent;
		color: var(--white);
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
	}

	@media (max-width: 768px) {
		.modal-content {
			max-width: 100%;
			border-radius: 0;
		}

		.close-button {
			width: 44px;
			height: 44px;
		}

		.modal-image {
			height: 200px;
		}

		.modal-body {
			padding: 1.25rem;
		}

		.modal-body h2 {
			font-size: 1.5rem;
		}

		.description {
			font-size: 0.95rem;
			line-height: 1.6;
		}

		.tech-tag {
			padding: 0.5rem 0.9rem;
			font-size: 0.85rem;
		}

		.modal-actions {
			flex-direction: column;
		}

		.action-button {
			padding: 0.875rem 1.25rem;
			font-size: 0.95rem;
		}
	}


</style>
