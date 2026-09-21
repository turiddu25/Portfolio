// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type Lenis from 'lenis';

declare global {
	interface Window {
		/** Set by the root layout; drives `.scroll-shell`, not the document. */
		lenis?: Lenis;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
