<script lang="ts">
	import { onMount } from 'svelte';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

	let conversations = [];
	let isAuthenticated = false;
	let isLoading = false;
	let error = '';

	let username = '';
	let password = '';

	async function getConversations() {
		if (!username || !password) {
			error = 'Username and password are required.';
			return;
		}

		isLoading = true;
		error = '';

		try {
			// Encode credentials for Basic Authentication
			const credentials = btoa(`${username}:${password}`);

			const response = await fetch(`${API_BASE_URL}/admin/conversations`, {
				headers: {
					Authorization: `Basic ${credentials}`
				}
			});

			if (response.status === 401) {
				throw new Error('Invalid username or password.');
			}
			if (!response.ok) {
				throw new Error('Failed to fetch conversations from the server.');
			}

			const data = await response.json();
			// Format the timestamp to be more readable
			conversations = data.map((convo) => ({
				...convo,
				timestamp: new Date(convo.timestamp).toLocaleString()
			}));

			isAuthenticated = true; // Success! Show the conversations table.
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred.';
			}
			isAuthenticated = false;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="admin-container">
	{#if !isAuthenticated}
		<div class="login-wrapper glass">
			<h1>Admin Login</h1>
			<p>Enter your backend admin credentials to view conversations.</p>
			<form on:submit|preventDefault={getConversations}>
				<div class="form-group">
					<label for="username">Username</label>
					<input id="username" type="text" bind:value={username} required />
				</div>
				<div class="form-group">
					<label for="password">Password</label>
					<input id="password" type="password" bind:value={password} required />
				</div>

				{#if error}
					<p class="error-message">{error}</p>
				{/if}

				<button type="submit" disabled={isLoading}>
					{#if isLoading}
						Loading...
					{:else}
						Login
					{/if}
				</button>
			</form>
		</div>
	{:else}
		<div class="conversations-wrapper">
			<h1>Conversation History</h1>
			<p>Showing the {conversations.length} most recent conversations.</p>
			
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Timestamp</th>
							<th>User Message</th>
							<th>AI Response</th>
						</tr>
					</thead>
					<tbody>
						{#each conversations as conversation (conversation.id)}
							<tr>
								<td class="timestamp">{conversation.timestamp}</td>
								<td>{conversation.user_message}</td>
								<td>{conversation.ai_response}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-container {
		min-height: 100vh;
		background: var(--black);
		color: var(--white);
		padding: 4rem 2rem;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-family: var(--font-body);
	}

	.login-wrapper {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		font-family: var(--font-heading);
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.login-wrapper p {
		color: var(--grey-soft);
		margin-bottom: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		text-align: left;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		color: var(--white);
	}

	button {
		padding: 0.75rem 1rem;
		background: var(--white);
		color: var(--black);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-family: var(--font-heading);
		cursor: pointer;
		transition: transform 0.2s var(--ease);
	}

	button:hover {
		transform: translateY(-2px);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error-message {
		color: #ff6b6b;
		background: rgba(255, 107, 107, 0.1);
		padding: 0.5rem;
		border-radius: 4px;
		margin: 0;
	}

	.conversations-wrapper {
		width: 100%;
		max-width: 1200px;
	}
	
	.conversations-wrapper h1 {
		margin-bottom: 0.25rem;
	}

	.conversations-wrapper p {
		color: var(--grey-soft);
		margin-bottom: 2rem;
	}

	.table-container {
		overflow-x: auto;
		border: 1px solid var(--white);
		border-radius: 16px;
		background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 1rem 1.5rem;
		text-align: left;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
    
    tbody tr:last-child td {
        border-bottom: none;
    }

	thead {
		background: var(--grey-faint);
	}

	th {
		font-family: var(--font-heading);
		font-weight: 600;
	}

	.timestamp {
		color: var(--grey-soft);
		white-space: nowrap;
	}
</style>