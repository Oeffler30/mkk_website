import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/paths', () => ({
	resolve: (href: string) => href
}));

import { absSveltePath, appResolve } from './app-resolve.js';

describe('absSveltePath', () => {
	it('maps ./segment to /segment', () => {
		expect(absSveltePath('./datenschutz')).toBe('/datenschutz');
		expect(absSveltePath('./impressum')).toBe('/impressum');
	});

	it('leaves absolute paths unchanged', () => {
		expect(absSveltePath('/home')).toBe('/home');
		expect(absSveltePath('/en/about-us')).toBe('/en/about-us');
	});

	it('prefixes bare segments with /', () => {
		expect(absSveltePath('home')).toBe('/home');
	});

	it('passes through http(s) URLs', () => {
		expect(absSveltePath('https://example.com/x')).toBe('https://example.com/x');
		expect(absSveltePath('http://localhost/')).toBe('http://localhost/');
	});
});

describe('appResolve', () => {
	it('returns resolve() output for in-app paths', () => {
		expect(appResolve('/foo')).toBe('/foo');
		expect(appResolve('./bar')).toBe('/bar');
	});

	it('passes through external URLs without calling resolve', () => {
		expect(appResolve('https://example.org/a')).toBe('https://example.org/a');
	});
});
