/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_DASHBOARD_URL?: string;
	readonly VITE_ALLOW_LOCAL_DASHBOARD?: string;
	readonly VITE_FORMSPREE_ID?: string;
	/**
	 * Separate Formspree form for the field-notes list. Read by SubscribeCard,
	 * but it was never declared here or in .env.example, so it has almost
	 * certainly never been set — which means subscribers and project inquiries
	 * land in one form, told apart only by a `_subject` string. See the note in
	 * SubscribeCard for why that matters the day the list moves to a real ESP.
	 */
	readonly VITE_FORMSPREE_NOTES_ID?: string;
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
