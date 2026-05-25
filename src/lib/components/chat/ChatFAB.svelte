<script>
	import { onMount } from 'svelte';
	import { chatStore, openChat } from '$lib/stores/chatStore';

	let show = false;

	$: state = $chatStore;

	onMount(() => {
		function handleScroll() {
			show = window.scrollY > window.innerHeight * 0.7;
		}

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="fab-wrap" class:visible={show && !state.isOpen}>
	{#if state.unreadMessage}
		<button class="peek" on:click={openChat}>{state.unreadMessage}</button>
	{/if}
	<button class="chat-fab" on:click={openChat} aria-label="Open Colin-AI chat">
		<span></span>
	</button>
</div>

<style>
	.fab-wrap {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 70;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.75rem;
		opacity: 0;
		transform: translateY(16px);
		pointer-events: none;
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease);
	}

	.fab-wrap.visible {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.chat-fab {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: 1px solid var(--border-strong);
		background: var(--white);
		color: var(--black);
		cursor: pointer;
		position: relative;
		box-shadow: 0 10px 30px rgba(22, 20, 17, 0.18);
	}

	.chat-fab::after {
		content: '';
		position: absolute;
		inset: -6px;
		border: 1px solid var(--border-strong);
		border-radius: 50%;
		animation: pulse-ring 4s infinite;
	}

	.chat-fab span,
	.chat-fab span::before,
	.chat-fab span::after {
		position: absolute;
		background: var(--black);
		border-radius: 50%;
	}

	.chat-fab span {
		width: 24px;
		height: 16px;
		top: 18px;
		left: 16px;
		border-radius: 12px;
	}

	.chat-fab span::before {
		content: '';
		width: 7px;
		height: 7px;
		right: 2px;
		bottom: -3px;
	}

	.peek {
		max-width: min(300px, calc(100vw - 2rem));
		border: 1px solid var(--border-strong);
		border-radius: 14px;
		background: rgba(255, 250, 242, 0.88);
		color: var(--white);
		padding: 0.8rem 1rem;
		backdrop-filter: blur(10px);
		text-align: left;
		cursor: pointer;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@keyframes pulse-ring {
		0%,
		70%,
		100% {
			opacity: 0;
			transform: scale(1);
		}
		20% {
			opacity: 1;
		}
		45% {
			opacity: 0;
			transform: scale(1.35);
		}
	}

	@media (max-width: 767px) {
		.fab-wrap {
			right: 1rem;
			bottom: 1rem;
		}
	}
</style>
