<script>
	import { onMount } from 'svelte';

	let messages = [
		{ role: 'ai', text: 'Hey! I\'m Colin\'s AI assistant. Ask me anything about his work!' },
	];
	let inputValue = '';
	let isTyping = false;
	let chatContainer;

	const responses = {
		skills: 'Colin specializes in full-stack development with React, Node.js, Three.js, and modern web technologies. He has extensive experience in 3D web graphics and interactive experiences.',
		experience: 'Colin has 5+ years of professional experience building web applications, from startups to enterprise solutions. He\'s worked on everything from e-commerce platforms to immersive 3D experiences.',
		contact: 'You can reach Colin at colin@example.com or connect with him on LinkedIn. He\'s always open to discussing new projects and opportunities!',
		projects: 'Check out the project grid on the right! Colin has worked on various projects including web apps, 3D visualizations, and interactive experiences.',
		default: 'That\'s a great question! Feel free to explore Colin\'s projects or reach out directly to learn more.'
	};

	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	async function sendMessage() {
		if (!inputValue.trim()) return;

		const userMessage = inputValue;
		inputValue = '';

		messages = [...messages, { role: 'user', text: userMessage }];
		scrollToBottom();

		isTyping = true;
		scrollToBottom();

		// Simulate AI response delay
		await new Promise(resolve => setTimeout(resolve, 1500));

		isTyping = false;

		// Simple keyword matching for responses
		let response = responses.default;
		const lowerMessage = userMessage.toLowerCase();

		if (lowerMessage.includes('skill') || lowerMessage.includes('tech')) {
			response = responses.skills;
		} else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
			response = responses.experience;
		} else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
			response = responses.contact;
		} else if (lowerMessage.includes('project')) {
			response = responses.projects;
		}

		messages = [...messages, { role: 'ai', text: response }];
		scrollToBottom();
	}

	function handleKeypress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="chatbox glass">
	<div class="chat-header">
		<div class="status-indicator"></div>
		<span>AI Assistant</span>
	</div>

	<div class="chat-messages" bind:this={chatContainer}>
		{#each messages as message}
			<div class="message {message.role}">
				<div class="bubble">
					{message.text}
				</div>
			</div>
		{/each}

		{#if isTyping}
			<div class="message ai">
				<div class="bubble typing">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</div>
			</div>
		{/if}
	</div>

	<div class="chat-input">
		<input
			type="text"
			bind:value={inputValue}
			on:keypress={handleKeypress}
			placeholder="Ask me anything..."
		/>
		<button on:click={sendMessage} class="send-button">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
			</svg>
		</button>
	</div>
</div>

<style>
	.chatbox {
		width: 100%;
		height: 600px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.chat-header {
		padding: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-heading);
		font-weight: 600;
	}

	.status-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--white);
		animation: pulse 2s infinite;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: transparent;
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.message {
		display: flex;
		animation: fadeInUp 0.4s var(--ease);
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.ai {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 75%;
		padding: 0.875rem 1.25rem;
		border-radius: 16px;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.message.user .bubble {
		background: var(--white);
		color: var(--black);
		border-bottom-right-radius: 4px;
	}

	.message.ai .bubble {
		background: transparent;
		color: var(--white);
		border: 1px solid var(--white);
		border-bottom-left-radius: 4px;
	}

	.bubble.typing {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--white);
		animation: pulse 1.4s infinite;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	.chat-input {
		padding: 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		gap: 0.75rem;
	}

	.chat-input input {
		flex: 1;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		padding: 0.875rem 1.25rem;
		color: var(--white);
		font-family: var(--font-body);
		font-size: 0.95rem;
		transition: all 0.3s var(--ease);
	}

	.chat-input input::placeholder {
		color: var(--grey-soft);
	}

	.chat-input input:focus {
		outline: none;
		border-color: var(--white);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
	}

	.send-button {
		background: var(--white);
		color: var(--black);
		border: none;
		border-radius: 12px;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s var(--ease);
	}

	.send-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
	}

	.send-button:active {
		transform: scale(0.95);
	}

	@media (max-width: 768px) {
		.chatbox {
			height: 500px;
		}

		.bubble {
			max-width: 85%;
		}
	}
</style>
