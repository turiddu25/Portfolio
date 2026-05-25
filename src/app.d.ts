// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		lenis?: {
			raf: (time: number) => void;
			scrollTo: (target: Element | string, options?: Record<string, unknown>) => void;
			destroy: () => void;
			stop?: () => void;
			start?: () => void;
		};
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
