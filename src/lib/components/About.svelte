<section class="about-section" id="about">
	<div class="about-inner">
		<p>
			CS graduate of the University of Glasgow. Senior Developer &amp; AI Engineer at
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
			</a>.
		</p>
	</div>
</section>

<style>
	.about-section {
		background: transparent;
		padding: 10rem 1.5rem;
		border-top: 1px solid var(--border);
	}

	.about-inner {
		width: min(1200px, 100%);
		margin: 0 auto;
		font-family: var(--font-heading);
		font-size: clamp(1.75rem, 4vw, 3rem);
		line-height: 1.3;
		color: var(--grey-soft);
	}

	.about-inner :global(strong) {
		color: var(--white);
	}

	.company {
		color: var(--white);
		text-decoration: none;
		position: relative;
		display: inline-flex;
		align-items: baseline;
		gap: 0.25em;
		white-space: nowrap;
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
		transform-origin: left;
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
		width: 0.42em;
		height: 0.42em;
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

	@media (max-width: 767px) {
		.about-section {
			padding: 6rem 1rem;
		}

		.company {
			white-space: normal;
		}
	}
</style>
