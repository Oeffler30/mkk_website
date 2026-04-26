/** Lets the footer (or other UI) open the cookie settings dialog after consent was already saved. */
let openSettingsHandler: (() => void) | undefined;

export function registerCookieSettingsOpener(fn: () => void): () => void {
	openSettingsHandler = fn;
	return () => {
		openSettingsHandler = undefined;
	};
}

export function openCookieSettings(): void {
	openSettingsHandler?.();
}
