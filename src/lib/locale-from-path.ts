/**
 * Resolves UI locale from the URL path (must stay in sync with Paraglide `urlPatterns`:
 * English uses `/en` prefix; German is unprefixed).
 */
export function localeFromPathname(pathname: string, basePath = ''): 'de' | 'en' {
	const rel =
		basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
	if (rel === '/en' || rel.startsWith('/en/')) return 'en';
	return 'de';
}
