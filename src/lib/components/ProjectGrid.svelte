<script>
	import ProjectModal from './ProjectModal.svelte';

	let selectedProject = null;

	const projects = [
		{
			id: 1,
			title: 'E-Commerce Platform',
			description: 'Full-stack e-commerce solution with real-time inventory',
			details: 'Built with React, Node.js, and MongoDB. Features include real-time inventory management, payment processing, and admin dashboard.',
			tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
			image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop'
		},
		{
			id: 2,
			title: '3D Product Visualizer',
			description: 'Interactive 3D product configurator with Three.js',
			details: 'Advanced 3D web application allowing users to customize and visualize products in real-time with photorealistic rendering.',
			tech: ['Three.js', 'WebGL', 'React', 'GLSL'],
			image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop'
		},
		{
			id: 3,
			title: 'AI Content Dashboard',
			description: 'Analytics dashboard powered by machine learning',
			details: 'Comprehensive analytics platform with AI-powered insights, data visualization, and predictive analytics.',
			tech: ['Vue.js', 'Python', 'TensorFlow', 'D3.js'],
			image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
		},
		{
			id: 4,
			title: 'Real-Time Collaboration',
			description: 'WebSocket-based collaborative workspace',
			details: 'Real-time collaboration tool with live cursors, presence awareness, and synchronized editing capabilities.',
			tech: ['Socket.io', 'React', 'Redis', 'PostgreSQL'],
			image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
		},
		{
			id: 5,
			title: 'AR Mobile Experience',
			description: 'Augmented reality app for interior design',
			details: 'Mobile AR application allowing users to visualize furniture and decor in their space before purchasing.',
			tech: ['React Native', 'ARKit', 'ARCore', 'Three.js'],
			image: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&h=600&fit=crop'
		},
		{
			id: 6,
			title: 'Blockchain Marketplace',
			description: 'NFT marketplace with smart contracts',
			details: 'Decentralized marketplace for digital assets with smart contract integration and wallet connectivity.',
			tech: ['Solidity', 'Ethereum', 'Next.js', 'Web3.js'],
			image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop'
		}
	];

	function openProject(project) {
		selectedProject = project;
	}

	function closeModal() {
		selectedProject = null;
	}
</script>

<div class="project-grid">
	{#each projects as project, i}
		<button
			class="project-card"
			style="animation-delay: {i * 0.1}s"
			on:click={() => openProject(project)}
		>
			<div class="card-image">
				<img src={project.image} alt={project.title} loading="lazy" />
			</div>
			<div class="card-overlay">
				<h3>{project.title}</h3>
				<p>{project.description}</p>
			</div>
		</button>
	{/each}
</div>

{#if selectedProject}
	<ProjectModal project={selectedProject} on:close={closeModal} />
{/if}

<style>
	.project-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
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

	@media (max-width: 768px) {
		.project-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
