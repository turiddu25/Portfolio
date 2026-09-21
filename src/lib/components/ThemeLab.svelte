<script>
	// @ts-nocheck
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { palettes } from '$lib/theme/palettes';
	import { materialPresets } from '$lib/theme/materials';
	import { backdrops } from '$lib/theme/backdrops';
	import {
		paletteId,
		materialId,
		activePalette,
		activeMaterial,
		backdropId,
		activeBackdrop,
		setPalette,
		setMaterial,
		setBackdrop,
		labOpen
	} from '$lib/stores/themeStore';

	let collapsed = false;
	let copyState = 'idle';

	$: families = [...new Set(materialPresets.map((preset) => preset.family))];
	$: suggested = materialPresets.find((preset) => preset.id === $activePalette?.suggestedMaterial);

	async function shareLink() {
		const url = new URL($page.url);
		url.searchParams.set('palette', $paletteId);
		url.searchParams.set('material', $materialId);
		url.searchParams.set('backdrop', $backdropId);
		url.searchParams.set('lab', '1');

		// Keep SvelteKit's history state intact — a raw history.replaceState
		// would strip it and break the back button for this entry.
		replaceState(url, $page.state);

		try {
			await navigator.clipboard.writeText(url.toString());
			copyState = 'copied';
		} catch {
			copyState = 'failed';
		}
		setTimeout(() => (copyState = 'idle'), 1800);
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') labOpen.set(false);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<aside class="lab" class:collapsed aria-label="Theme lab">
	<header>
		<button class="toggle" aria-expanded={!collapsed} on:click={() => (collapsed = !collapsed)}>
			<span class="dot"></span>
			Theme lab
		</button>
		<button class="close" on:click={() => labOpen.set(false)} aria-label="Close theme lab">×</button
		>
	</header>

	{#if !collapsed}
		<div class="body">
			<section>
				<h4>Palette <em>{$activePalette?.name}</em></h4>
				<div class="grid">
					{#each palettes as palette}
						<button
							class="swatch"
							class:active={palette.id === $paletteId}
							title={`${palette.name} — ${palette.mood}`}
							on:click={() => setPalette(palette.id)}
						>
							<span class="chips">
								<span style={`background:${palette.vars.base}`}></span>
								<span style={`background:${palette.vars.ink}`}></span>
								<span style={`background:${palette.vars.accent}`}></span>
							</span>
							{palette.name}
						</button>
					{/each}
				</div>
				{#if $activePalette?.contrast}
					<p class="note">{$activePalette.contrast}</p>
				{/if}
				{#if suggested && suggested.id !== $materialId}
					<button class="suggest" on:click={() => setMaterial(suggested.id)}>
						Pairs with {suggested.name} →
					</button>
				{/if}
			</section>

			<section>
				<h4>Material <em>{$activeMaterial?.name}</em></h4>
				{#each families as family}
					<p class="family">{family}</p>
					<div class="grid">
						{#each materialPresets.filter((preset) => preset.family === family) as preset}
							<button
								class="pill"
								class:active={preset.id === $materialId}
								title={preset.look}
								on:click={() => setMaterial(preset.id)}
							>
								{preset.name}
							</button>
						{/each}
					</div>
				{/each}
				{#if $activeMaterial?.look}
					<p class="note">{$activeMaterial.look}</p>
				{/if}
			</section>

			<section>
				<h4>Backdrop <em>{$activeBackdrop?.name}</em></h4>
				<div class="grid">
					{#each backdrops as backdrop}
						<button
							class="pill"
							class:active={backdrop.id === $backdropId}
							title={backdrop.note}
							on:click={() => setBackdrop(backdrop.id)}
						>
							{backdrop.name}
						</button>
					{/each}
				</div>
				{#if $activeBackdrop?.note}
					<p class="note">{$activeBackdrop.note}</p>
				{/if}
			</section>

			<button class="share" on:click={shareLink}>
				{copyState === 'copied'
					? 'Link copied'
					: copyState === 'failed'
						? 'Copy failed — the URL bar has it'
						: 'Copy link to this combination'}
			</button>
		</div>
	{/if}
</aside>

<style>
	.lab {
		position: fixed;
		left: 1.25rem;
		bottom: 1.25rem;
		z-index: 80;
		width: min(320px, calc(100vw - 2.5rem));
		max-height: min(72vh, 640px);
		overflow: auto;
		background: var(--overlay);
		border: 1px solid var(--border-strong);
		border-radius: 18px;
		backdrop-filter: blur(14px);
		box-shadow: 0 18px 50px var(--shadow-strong);
		font-family: var(--font-body);
		color: var(--white);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.7rem 0.75rem 0.7rem 0.9rem;
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		background: var(--overlay);
		backdrop-filter: blur(14px);
	}

	.toggle,
	.close {
		background: transparent;
		border: 0;
		color: inherit;
		cursor: pointer;
		font-family: var(--font-heading);
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.close {
		font-size: 1.25rem;
		line-height: 1;
		opacity: 0.6;
	}

	.close:hover {
		opacity: 1;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
	}

	.body {
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	h4 {
		font-family: var(--font-heading);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--grey-soft);
		margin-bottom: 0.5rem;
	}

	h4 em {
		font-style: normal;
		color: var(--white);
		letter-spacing: 0.04em;
	}

	.family {
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--grey-soft);
		margin: 0.6rem 0 0.35rem;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.swatch,
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.34rem 0.6rem;
		font-size: 0.72rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--white);
		cursor: pointer;
	}

	.swatch.active,
	.pill.active {
		border-color: var(--accent);
		color: var(--accent-deep);
		box-shadow: inset 0 0 0 1px var(--accent);
	}

	.chips {
		display: inline-flex;
		border-radius: 999px;
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.chips span {
		width: 9px;
		height: 12px;
		display: block;
	}

	.note {
		margin-top: 0.55rem;
		font-size: 0.68rem;
		line-height: 1.45;
		color: var(--grey-soft);
	}

	.suggest {
		margin-top: 0.5rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.68rem;
		border-radius: 999px;
		border: 1px dashed var(--border-strong);
		background: transparent;
		color: var(--accent-deep);
		cursor: pointer;
	}

	.share {
		padding: 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: transparent;
		color: var(--white);
		font-size: 0.72rem;
		cursor: pointer;
	}

	.share:hover {
		border-color: var(--accent);
		color: var(--accent-deep);
	}

	.lab.collapsed {
		width: auto;
	}

	@media (max-width: 768px) {
		.lab {
			left: 0.75rem;
			bottom: 0.75rem;
			max-height: 60vh;
		}
	}
</style>
