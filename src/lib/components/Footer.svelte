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
		<p class="footer-name">COLIN SALVATORE NARDO</p>

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
		padding: 6rem 2rem 2rem;
		background: transparent;
		overflow: hidden;
	}

	.footer-content {
		position: relative;
		max-width: 1400px;
		margin: 0 auto;
	}

	.footer-name {
		margin: 0 0 clamp(1.5rem, 3vw, 3rem);
		font-family: var(--font-heading);
		font-size: clamp(4rem, 12vw, 13rem);
		font-weight: 700;
		line-height: 0.78;
		text-align: center;
		color: transparent;
		-webkit-text-stroke: 1px var(--accent);
		opacity: 0.7;
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
		border: 2px solid var(--accent);
		border-radius: 50%;
		color: var(--accent);
		transition: all 0.4s var(--ease);
		position: relative;
		overflow: hidden;
	}

	.social-link::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--accent);
		transform: scale(0);
		transition: transform 0.4s var(--ease);
		border-radius: 50%;
		z-index: -1;
	}

	.social-link:hover {
		color: var(--black);
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(22, 20, 17, 0.14);
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

		.footer-name {
			margin-bottom: 1.25rem;
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
