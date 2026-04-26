import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('cookie-consent-banner-session', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('starts with banner not dismissed for a fresh module', async () => {
		const m = await import('./cookie-consent-banner-session.js');
		expect(m.wasCookieBannerDismissedThisSession()).toBe(false);
	});

	it('markCookieBannerDismissedThisSession persists until reset', async () => {
		const m = await import('./cookie-consent-banner-session.js');
		m.markCookieBannerDismissedThisSession();
		expect(m.wasCookieBannerDismissedThisSession()).toBe(true);
		const m2 = await import('./cookie-consent-banner-session.js');
		expect(m2.wasCookieBannerDismissedThisSession()).toBe(true);
	});
});
