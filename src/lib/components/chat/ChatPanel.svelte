<script>
	// @ts-nocheck
	import { afterUpdate, onMount } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import { chatStore, closeChat, openChat, sendChatMessage, stopChatAudio } from '$lib/stores/chatStore';

	let inputValue = '';
	let chatContainer;

	$: state = $chatStore;

	function handleKeydown(event) {
		if (event.key === 'Escape' && state.isOpen) {
			closeChat();
		}

		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			openChat();
		}
	}

	function handleInputKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submitMessage();
		}
	}

	async function submitMessage() {
		const message = inputValue;
		inputValue = '';
		await sendChatMessage(message);
	}

	afterUpdate(() => {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	onMount(() => {
		return () => stopChatAudio();
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if state.isOpen}
	<button class="chat-backdrop" aria-label="Close chat" on:click={closeChat}></button>
{/if}

<aside class="chat-panel glass" class:open={state.isOpen} aria-hidden={!state.isOpen}>
	<header class="chat-header">
		<div class="avatar" aria-hidden="true">C</div>
		<div>
			<h2>Colin-AI</h2>
			<p><span class:playing={state.isPlayingAudio}></span>{state.isPlayingAudio ? 'Speaking' : 'Available'}</p>
		</div>
		<button class="close-button" on:click={closeChat} aria-label="Close chat">×</button>
	</header>

	<div class="chat-messages" bind:this={chatContainer}>
		{#each state.messages as message}
			<ChatMessage {message} />
		{/each}

		{#if state.isTyping}
			<div class="typing" aria-label="Colin-AI is typing">
				<span></span>
				<span></span>
				<span></span>
			</div>
		{/if}
	</div>

	<form class="chat-input" on:submit|preventDefault={submitMessage}>
		<input
			type="text"
			bind:value={inputValue}
			on:keydown={handleInputKeydown}
			placeholder="Ask me anything..."
			disabled={state.isTyping || state.isPlayingAudio}
		/>
		<button type="submit" aria-label="Send message" disabled={state.isTyping || state.isPlayingAudio}>
			→
		</button>
	</form>
</aside>

<style>
	.chat-backdrop {
		position: fixed;
		inset: 0;
		z-index: 80;
		border: 0;
		background: rgba(22, 20, 17, 0.22);
		backdrop-filter: blur(4px);
		cursor: pointer;
	}

	.chat-panel {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 90;
		width: min(440px, 100vw);
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		border-radius: 0;
		border-width: 0 0 0 1px;
		transform: translateX(100%);
		transition: transform 0.4s var(--ease);
	}

	.chat-panel.open {
		transform: translateX(0);
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 1.25rem;
		border-bottom: 1px solid var(--border);
	}

	.avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: var(--white);
		color: var(--black);
		font-family: var(--font-heading);
		font-weight: 700;
	}

	.chat-header h2 {
		font-size: 1rem;
	}

	.chat-header p {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--grey-soft);
		font-size: 0.85rem;
	}

	.chat-header p span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--white);
		animation: pulse 2s infinite;
	}

	.chat-header p span.playing {
		background: #89cff0;
	}

	.close-button {
		margin-left: auto;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border-strong);
		border-radius: 50%;
		background: transparent;
		color: var(--white);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.typing {
		width: fit-content;
		display: flex;
		gap: 0.45rem;
		padding: 1rem 1.2rem;
		border: 1px solid var(--border-strong);
		border-radius: 16px 16px 16px 4px;
	}

	.typing span {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--white);
		animation: pulse 1.4s infinite;
	}

	.typing span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing span:nth-child(3) {
		animation-delay: 0.4s;
	}

	.chat-input {
		display: flex;
		gap: 0.75rem;
		padding: 1.25rem;
		border-top: 1px solid var(--border);
	}

	.chat-input input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: 1px solid var(--border-strong);
		border-radius: 12px;
		padding: 0.875rem 1rem;
		color: var(--white);
		font: inherit;
	}

	.chat-input button {
		width: 48px;
		height: 48px;
		border: 0;
		border-radius: 12px;
		background: var(--white);
		color: var(--black);
		font-size: 1.4rem;
		cursor: pointer;
	}

	.chat-input input:disabled,
	.chat-input button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
