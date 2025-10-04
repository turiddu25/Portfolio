<script>
	import { onMount } from 'svelte';
	import Chatbox from './Chatbox.svelte';
	import ProjectGrid from './ProjectGrid.svelte';

	let sectionVisible = false;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						sectionVisible = true;
					}
				});
			},
			{ threshold: 0.2 }
		);

		const section = document.querySelector('.chat-projects-section');
		if (section) observer.observe(section);

		return () => observer.disconnect();
	});
</script>

<section class="chat-projects-section" class:visible={sectionVisible}>
	<div class="container">
		<div class="left-column">
			<Chatbox />
		</div>

		<div class="right-column">
			<ProjectGrid />
		</div>
	</div>
</section>

<style>
	.chat-projects-section {
		min-height: 100vh;
		padding: 4rem 2rem;
		position: relative;
		background: var(--black);
		z-index: 10;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 3rem;
		align-items: start;
	}

	.left-column {
		position: sticky;
		top: 2rem;
	}

	.right-column {
		opacity: 0;
		transform: translateX(50px);
		transition: all 1s var(--ease);
	}

	.visible .right-column {
		opacity: 1;
		transform: translateX(0);
	}

	@media (max-width: 1024px) {
		.container {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.left-column {
			position: relative;
			top: 0;
		}
	}
</style>
