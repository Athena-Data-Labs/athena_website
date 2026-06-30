/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DASHBOARD_URL?: string;
	readonly VITE_ALLOW_LOCAL_DASHBOARD?: string;
	readonly VITE_FORMSPREE_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Umami analytics tracker, injected by the script tag in index.html.
interface Window {
	umami?: {
		track: (eventName: string, eventData?: Record<string, unknown>) => void;
	};
}
