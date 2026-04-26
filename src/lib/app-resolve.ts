import type { Pathname } from '$app/types';
import { resolve } from '$app/paths';

/**
 * Paraglide `localizeHref` can return `./segment` on the server; SvelteKit `resolve()`
 * requires a pathname that starts with `/`.
 */
export function absSveltePath(path: string): string {
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	if (path.startsWith('./')) return '/' + path.slice(2);
	if (path.startsWith('/')) return path;
	return '/' + path;
}

/** Apply `base` and normalize Paraglide-relative output. External URLs are returned as-is. */
export function appResolve(path: string): string {
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return resolve(absSveltePath(path) as Pathname);
}
