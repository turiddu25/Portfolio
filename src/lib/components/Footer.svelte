<script>
	const socials = [
		{
			name: 'GitHub',
			url: 'https://github.com/turiddu25',
			icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'
		},
		{
			name: 'LinkedIn',
			url: 'https://www.linkedin.com/in/colin-salvatore-nardo/',
			icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
		},
		{
			name: 'Email',
			url: 'mailto:colin.nardo@gmail.com',
			icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
		}
	];

	const currentYear = new Date().getFullYear();
</script>

<footer>
	<div class="footer-content">
		<!-- Abstract line art background -->
		<svg class="footer-bg" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
			<path d="M0,100 Q250,50 500,100 T1000,100" stroke="white" stroke-width="1" fill="none" opacity="0.05"/>
			<path d="M0,200 Q250,150 500,200 T1000,200" stroke="white" stroke-width="1" fill="none" opacity="0.05"/>
			<path d="M0,300 Q250,250 500,300 T1000,300" stroke="white" stroke-width="1" fill="none" opacity="0.05"/>
			<circle cx="100" cy="100" r="3" fill="white" opacity="0.05"/>
			<circle cx="300" cy="200" r="3" fill="white" opacity="0.05"/>
			<circle cx="500" cy="150" r="3" fill="white" opacity="0.05"/>
			<circle cx="700" cy="250" r="3" fill="white" opacity="0.05"/>
			<circle cx="900" cy="180" r="3" fill="white" opacity="0.05"/>
		</svg>

		<div class="footer-inner">
			<div class="social-links">
				{#each socials as social}
					<a
						href={social.url}
						target="_blank"
						rel="noopener noreferrer"
						class="social-link"
						aria-label={social.name}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d={social.icon}/>
						</svg>
					</a>
				{/each}
			</div>

			<p class="copyright">
				© {currentYear} Colin Salvatore Nardo. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	footer {
		position: relative;
		padding: 4rem 2rem 2rem;
		background: var(--black);
		overflow: hidden;
	}

	.footer-content {
		position: relative;
		max-width: 1400px;
		margin: 0 auto;
	}

	.footer-bg {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}

	.footer-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.social-links {
		display: flex;
		gap: 2rem;
	}

	.social-link {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--white);
		border-radius: 50%;
		color: var(--white);
		transition: all 0.4s var(--ease);
		position: relative;
		overflow: hidden;
	}

	.social-link::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--white);
		transform: scale(0);
		transition: transform 0.4s var(--ease);
		border-radius: 50%;
		z-index: -1;
	}

	.social-link:hover {
		color: var(--black);
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(255, 255, 255, 0.2);
	}

	.social-link:hover::before {
		transform: scale(1);
	}

	.copyright {
		font-size: 0.9rem;
		color: var(--grey-soft);
		text-align: center;
		margin: 0;
	}

	@media (max-width: 768px) {
		footer {
			padding: 3rem 1rem 1.5rem;
		}

		.social-links {
			gap: 1.5rem;
		}

		.social-link {
			width: 40px;
			height: 40px;
		}

		.copyright {
			font-size: 0.8rem;
		}
	}
</style>
