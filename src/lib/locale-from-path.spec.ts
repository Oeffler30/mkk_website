import { describe, expect, it } from 'vitest';
import { localeFromPathname } from './locale-from-path.js';

describe('localeFromPathname', () => {
	it('treats unprefixed paths as German', () => {
		expect(localeFromPathname('/')).toBe('de');
		expect(localeFromPathname('/home')).toBe('de');
		expect(localeFromPathname('/impressum')).toBe('de');
		expect(localeFromPathname('/metalparty-infos')).toBe('de');
	});

	it('treats /en and /en/... as English', () => {
		expect(localeFromPathname('/en')).toBe('en');
		expect(localeFromPathname('/en/')).toBe('en');
		expect(localeFromPathname('/en/home')).toBe('en');
		expect(localeFromPathname('/en/about-us')).toBe('en');
	});

	it('strips SvelteKit base before deciding', () => {
		expect(localeFromPathname('/mybase/home', '/mybase')).toBe('de');
		expect(localeFromPathname('/mybase/en/home', '/mybase')).toBe('en');
	});

	it('does not treat /english as English', () => {
		expect(localeFromPathname('/english')).toBe('de');
	});
});
