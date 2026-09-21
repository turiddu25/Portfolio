import { writable } from 'svelte/store';

/**
 * Scroll offset of `.scroll-shell`, published by the layout.
 *
 * The document does not scroll (see app.css), so `window.scrollY` is always 0 —
 * anything that reacts to scroll position reads this instead.
 */
export const scrollY = writable(0);
