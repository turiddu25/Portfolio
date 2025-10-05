<script>
    import { onMount } from 'svelte';

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    let messages = [
        { role: 'ai', text: 'Hey! I\'m Colin\'s AI Clone. Ask me anything about his work!' },
    ];
    let inputValue = '';
    let isTyping = false;
    let isPlayingAudio = false; // New state to track audio playback
    let chatContainer;
    let sessionId = null;

    function scrollToBottom() {
        setTimeout(() => {
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    }

    async function playAudioFromBase64(base64String) {
        if (!base64String) return;
        try {
            isPlayingAudio = true;
            const audio = new Audio(`data:audio/wav;base64,${base64String}`);
            
            // This promise resolves when the audio finishes playing
            await new Promise((resolve, reject) => {
                audio.onended = resolve;
                audio.onerror = reject;
                audio.play();
            });

        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            isPlayingAudio = false;
        }
    }

    async function sendMessage() {
        if (!inputValue.trim() || isTyping || isPlayingAudio) return;

        const userMessage = inputValue;
        inputValue = '';

        messages = [...messages, { role: 'user', text: userMessage }];
        scrollToBottom();

        isTyping = true;
        scrollToBottom();

        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (sessionId) {
                headers['X-Session-ID'] = sessionId;
            }

            // Call the /ask_tts endpoint to get both text and audio
            const response = await fetch(`${API_BASE_URL}/ask_tts`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ question: userMessage }),
            });

            isTyping = false; // Turn off typing indicator once response is received

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to get a response from the server.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const newSessionId = response.headers.get('x-session-id');
            if (newSessionId) {
                sessionId = newSessionId;
            }

            const data = await response.json();
            const aiResponse = data.answer;
            const audioData = data.audio; // The base64 audio string
            
            messages = [...messages, { role: 'ai', text: aiResponse }];
            scrollToBottom();

            // Play the audio. Browsers allow this because it's a direct result of user interaction (clicking send).
            if (audioData) {
                await playAudioFromBase64(audioData);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            messages = [...messages, { role: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }];
        } finally {
            // Ensure indicators are off, even if something fails
            isTyping = false;
            isPlayingAudio = false;
            scrollToBottom();
        }
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
        <div class="status-indicator" class:playing={isPlayingAudio}></div>
        <span>Colin-AI</span>
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
            disabled={isTyping || isPlayingAudio}
        />
        <button on:click={sendMessage} class="send-button" aria-label="Send message" disabled={isTyping || isPlayingAudio}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
        </button>
    </div>
</div>

<style>
    /* Add this new keyframe animation and class for the playing indicator */
    @keyframes pulse-strong {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.3);
        opacity: 0.8;
      }
    }

    .status-indicator.playing {
        animation: pulse-strong 1s infinite;
        background-color: #89CFF0; /* A light blue to indicate activity */
    }

    /* Add disabled states for the input and button */
    .chat-input input:disabled,
    .send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    /* Your existing styles from before go here */
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
        transition: background-color 0.3s var(--ease);
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