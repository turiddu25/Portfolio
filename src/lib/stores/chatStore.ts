import { get, writable } from 'svelte/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ChatMessage = {
	role: 'ai' | 'user';
	text: string;
	unread?: boolean;
};

type ChatState = {
	isOpen: boolean;
	messages: ChatMessage[];
	sessionId: string | null;
	isTyping: boolean;
	isPlayingAudio: boolean;
	unreadMessage: string;
};

const initialState: ChatState = {
	isOpen: false,
	messages: [{ role: 'ai', text: "Hey! I'm Colin's AI Clone. Ask me anything about his work!" }],
	sessionId: null,
	isTyping: false,
	isPlayingAudio: false,
	unreadMessage: ''
};

export const chatStore = writable<ChatState>(initialState);

let currentAudio: HTMLAudioElement | null = null;

export function openChat() {
	chatStore.update((state) => ({ ...state, isOpen: true, unreadMessage: '' }));
}

export function closeChat() {
	chatStore.update((state) => ({ ...state, isOpen: false }));
}

export function toggleChat() {
	const state = get(chatStore);
	state.isOpen ? closeChat() : openChat();
}

async function playAudioFromBase64(base64String: string) {
	if (!base64String) return;

	try {
		chatStore.update((state) => ({ ...state, isPlayingAudio: true }));
		const audio = new Audio(`data:audio/wav;base64,${base64String}`);
		currentAudio = audio;

		await new Promise((resolve, reject) => {
			audio.onended = resolve;
			audio.onerror = reject;
			audio.play();
		});
	} catch (error) {
		console.error('Error playing audio:', error);
	} finally {
		currentAudio = null;
		chatStore.update((state) => ({ ...state, isPlayingAudio: false }));
	}
}

export function stopChatAudio() {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio = null;
	}
	chatStore.update((state) => ({ ...state, isPlayingAudio: false }));
}

export async function sendChatMessage(question: string) {
	const text = question.trim();
	const state = get(chatStore);

	if (!text || state.isTyping || state.isPlayingAudio) return;

	chatStore.update((current) => ({
		...current,
		messages: [...current.messages, { role: 'user', text }],
		isTyping: true
	}));

	try {
		const current = get(chatStore);
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		if (current.sessionId) {
			headers['X-Session-ID'] = current.sessionId;
		}

		const response = await fetch(`${API_BASE_URL}/ask_tts`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ question: text })
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ detail: 'Failed to get a response from the server.' }));
			throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
		}

		const sessionId = response.headers.get('x-session-id');
		const data = await response.json();
		const answer = data.answer || "Sorry, I couldn't produce a response.";
		const wasOpen = get(chatStore).isOpen;

		chatStore.update((current) => ({
			...current,
			sessionId: sessionId || current.sessionId,
			messages: [...current.messages, { role: 'ai', text: answer }],
			unreadMessage: wasOpen ? '' : answer,
			isTyping: false
		}));

		if (data.audio) {
			await playAudioFromBase64(data.audio);
		}
	} catch (error) {
		console.error('Failed to send message:', error);
		chatStore.update((current) => ({
			...current,
			messages: [
				...current.messages,
				{ role: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }
			],
			isTyping: false,
			isPlayingAudio: false
		}));
	} finally {
		chatStore.update((current) => ({ ...current, isTyping: false }));
	}
}

