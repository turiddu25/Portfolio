<script>
	export let message;
</script>

<div class="message {message.role}">
	<div class="bubble">{message.text}</div>
</div>

<style>
	.message {
		display: flex;
		animation: fadeInUp 0.35s var(--ease);
	}

	.message.user {
		justify-content: flex-end;
	}

	.message.ai {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 78%;
		padding: 0.875rem 1.1rem;
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
		border: 1px solid rgba(255, 255, 255, 0.65);
		border-bottom-left-radius: 4px;
	}
</style>

