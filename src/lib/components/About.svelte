<section class="about-section" id="about">
	<div class="about-inner">
		<p>CS student at the University of Glasgow. Incoming Data Analyst intern at <span>Hamilton Ross Group</span>.</p>
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

	.about-inner :global(strong),
	.about-inner span {
		color: var(--white);
	}

	@media (max-width: 767px) {
		.about-section {
			padding: 6rem 1rem;
		}
	}
</style>
