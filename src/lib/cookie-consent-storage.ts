export const CONSENT_STORAGE_KEY = 'mkk.cookieConsent';

/** Increment when categories or legal text change so users see the banner again. */
export const CONSENT_SCHEMA_VERSION = 1;

export type StoredConsent = {
	schemaVersion: number;
	functional: boolean;
	analytics: boolean;
	marketing: boolean;
	savedAt: string;
};

export function readConsent(): StoredConsent | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw) as Partial<StoredConsent>;
		if (data.schemaVersion !== CONSENT_SCHEMA_VERSION) return null;
		if (
			typeof data.functional !== 'boolean' ||
			typeof data.analytics !== 'boolean' ||
			typeof data.marketing !== 'boolean' ||
			typeof data.savedAt !== 'string'
		) {
			return null;
		}
		return data as StoredConsent;
	} catch {
		return null;
	}
}

export function writeConsent(
	prefs: Omit<StoredConsent, 'schemaVersion' | 'savedAt'>
): StoredConsent {
	const value: StoredConsent = {
		schemaVersion: CONSENT_SCHEMA_VERSION,
		...prefs,
		savedAt: new Date().toISOString()
	};
	try {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
		}
	} catch {
		/* private mode / quota — caller still hides UI */
	}
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('mkk:cookie-consent-updated', { detail: value }));
	}
	return value;
}

export function clearConsent(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(CONSENT_STORAGE_KEY);
}
