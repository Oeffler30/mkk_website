import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	clearConsent,
	CONSENT_SCHEMA_VERSION,
	CONSENT_STORAGE_KEY,
	readConsent,
	writeConsent
} from './cookie-consent-storage.js';

function createMemoryStorage(): Storage {
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		key: (i: number) => [...map.keys()][i] ?? null,
		clear: () => {
			map.clear();
		},
		getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
		setItem: (k: string, v: string) => {
			map.set(k, v);
		},
		removeItem: (k: string) => {
			map.delete(k);
		}
	} as Storage;
}

describe('cookie-consent-storage', () => {
	const dispatchEvent = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('localStorage', createMemoryStorage());
		vi.stubGlobal('window', { dispatchEvent });
		dispatchEvent.mockClear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('round-trips consent via readConsent / writeConsent', () => {
		expect(readConsent()).toBeNull();

		const saved = writeConsent({ functional: true, analytics: false, marketing: false });
		expect(saved.schemaVersion).toBe(CONSENT_SCHEMA_VERSION);
		expect(saved.functional).toBe(true);
		expect(saved.analytics).toBe(false);
		expect(saved.marketing).toBe(false);
		expect(saved.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

		const read = readConsent();
		expect(read).toEqual(saved);
		expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeTruthy();
	});

	it('dispatches mkk:cookie-consent-updated on writeConsent', () => {
		const detail = writeConsent({ functional: false, analytics: false, marketing: false });
		expect(dispatchEvent).toHaveBeenCalledTimes(1);
		const call = dispatchEvent.mock.calls[0][0] as CustomEvent;
		expect(call.type).toBe('mkk:cookie-consent-updated');
		expect(call.detail).toEqual(detail);
	});

	it('returns null for wrong schema version', () => {
		localStorage.setItem(
			CONSENT_STORAGE_KEY,
			JSON.stringify({
				schemaVersion: CONSENT_SCHEMA_VERSION - 1,
				functional: false,
				analytics: false,
				marketing: false,
				savedAt: 'x'
			})
		);
		expect(readConsent()).toBeNull();
	});

	it('returns null for malformed JSON', () => {
		localStorage.setItem(CONSENT_STORAGE_KEY, '{');
		expect(readConsent()).toBeNull();
	});

	it('returns null when required fields are missing types', () => {
		localStorage.setItem(
			CONSENT_STORAGE_KEY,
			JSON.stringify({
				schemaVersion: CONSENT_SCHEMA_VERSION,
				functional: 'yes',
				analytics: false,
				marketing: false,
				savedAt: '2020-01-01T00:00:00.000Z'
			})
		);
		expect(readConsent()).toBeNull();
	});

	it('clearConsent removes the key', () => {
		writeConsent({ functional: false, analytics: false, marketing: false });
		expect(readConsent()).not.toBeNull();
		clearConsent();
		expect(readConsent()).toBeNull();
	});
});
