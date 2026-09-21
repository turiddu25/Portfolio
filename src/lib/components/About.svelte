<section class="about-section" id="about">
	<div class="about-inner">
		<p class="study">CS graduate of the University of Glasgow</p>
		<p class="role">
			<span class="title">Senior Developer &amp; AI Engineer</span>
			<span class="employer">
				at
				<a
					class="company"
					href="https://hamiltonrossgroup.co.uk"
					target="_blank"
					rel="noopener noreferrer"
				>
					Hamilton Ross Group
					<svg class="company-arrow" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M7 17L17 7M9 7h8v8" />
					</svg>
				</a>
			</span>
		</p>
	</div>
</section>

<style>
	.about-section {
		background: transparent;
		/* Tight underneath: the projects section supplies the gap below. */
		padding: clamp(4rem, 7vw, 6rem) 1.5rem clamp(1rem, 2vw, 2rem);
	}

	.about-inner {
		width: min(1400px, 100%);
		margin: 0 auto;
		font-family: var(--font-heading);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.study {
		margin: 0;
		font-size: clamp(0.95rem, 1.5vw, 1.25rem);
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--grey-soft);
	}

	/*
	 * Desktop keeps the whole sentence on one line — the size is tied to the
	 * viewport so it always fits. Below 1024px one line would be too small to
	 * carry the page, so it breaks at the one place it should: role / employer.
	 */
	.role {
		margin: 0;
		font-size: min(2.75rem, 3vw);
		font-weight: 700;
		line-height: 1.1;
		color: var(--white);
		white-space: nowrap;
	}

	.employer {
		color: var(--grey-soft);
	}

	.company {
		color: var(--white);
		text-decoration: none;
		position: relative;
		display: inline-flex;
		align-items: baseline;
		gap: 0.2em;
	}

	.company::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.08em;
		height: 2px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: center;
		transition: transform 0.45s var(--ease);
	}

	.company:hover,
	.company:focus-visible {
		color: var(--accent);
	}

	.company:hover::after,
	.company:focus-visible::after {
		transform: scaleX(1);
	}

	.company-arrow {
		width: 0.4em;
		height: 0.4em;
		flex: none;
		align-self: center;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.55;
		transition:
			transform 0.45s var(--ease),
			opacity 0.45s var(--ease);
	}

	.company:hover .company-arrow,
	.company:focus-visible .company-arrow {
		opacity: 1;
		transform: translate(0.12em, -0.12em);
	}

	@media (max-width: 1023px) {
		.role {
			font-size: clamp(1.3rem, 5.6vw, 2.4rem);
			white-space: normal;
			display: flex;
			flex-direction: column;
			gap: 0.15em;
		}

		.title,
		.employer {
			display: block;
		}

		.employer {
			font-size: 0.78em;
		}
	}

	@media (max-width: 767px) {
		.about-section {
			padding: 3.5rem 1rem 1rem;
		}

		/* Keep the eyebrow on one line on the narrowest phones. */
		.study {
			font-size: clamp(0.72rem, 3.1vw, 0.95rem);
		}

		.about-inner {
			gap: 0.6rem;
		}

		.study {
			letter-spacing: 0.04em;
		}
	}
</style>
