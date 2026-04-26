<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { appResolve } from '$lib/app-resolve.js';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import CookieBanner from '$lib/components/CookieBanner.svelte';
	import { openCookieSettings } from '$lib/cookie-consent-ui.js';
	import { localeFromPathname } from '$lib/locale-from-path.js';
	import { deLocalizeHref, localizeHref, setLocale } from '$lib/paraglide/runtime.js';
	import './layout.css';

	const { children } = $props();

	const locale = $derived(localeFromPathname(page.url.pathname, base));

	/** Keep Paraglide cookie / runtime aligned with the URL after client navigations. */
	$effect(() => {
		if (!browser) return;
		setLocale(locale, { reload: false });
	});

	/** Path without SvelteKit `base`, so Paraglide de-localization matches real routes. */
	const pathnameNoBase = $derived(
		base && page.url.pathname.startsWith(base)
			? page.url.pathname.slice(base.length) || '/'
			: page.url.pathname
	);
	const delocalizedPath = $derived(deLocalizeHref(pathnameNoBase));
	const currentPath = $derived(delocalizedPath.replace(/\/$/, '') || '/');

	/** Pass `{ locale }` from the URL so these update on client navigations; `getLocale()` alone is not reactive in Svelte. */
	const homeHref = $derived(appResolve(localizeHref('/home', { locale })));
	const aboutHref = $derived(appResolve(localizeHref('/about-us', { locale })));
	const metalpartyHref = $derived(appResolve(localizeHref('/metalparty-infos', { locale })));
	const membersHref = $derived(appResolve(localizeHref('/become-a-member', { locale })));
	const picturesHref = $derived(appResolve(localizeHref('/pictures', { locale })));
	const imprintHref = $derived(appResolve(localizeHref('/impressum', { locale })));
	const privacyHref = $derived(appResolve(localizeHref('/datenschutz', { locale })));
	const deHref = $derived(appResolve(localizeHref(delocalizedPath, { locale: 'de' })));
	const enHref = $derived(appResolve(localizeHref(delocalizedPath, { locale: 'en' })));

	const msg = $derived({ locale } as const);

	const brandLogoSrc = $derived(`${base}/logo_metalparty.png`);

	const mainNav = $derived([
		{ path: '/home', href: homeHref, label: () => m.nav_home({}, msg) },
		{ path: '/about-us', href: aboutHref, label: () => m.nav_about({}, msg) },
		{ path: '/metalparty-infos', href: metalpartyHref, label: () => m.nav_metalparty({}, msg) },
		{ path: '/become-a-member', href: membersHref, label: () => m.nav_members({}, msg) },
		{ path: '/pictures', href: picturesHref, label: () => m.nav_pictures({}, msg) }
	] as const);

	let navOpen = $state(false);

	$effect(() => {
		void pathnameNoBase;
		navOpen = false;
	});

	$effect(() => {
		if (!browser) return;
		document.documentElement.classList.toggle('mkk-mobile-nav-open', navOpen);
		return () => document.documentElement.classList.remove('mkk-mobile-nav-open');
	});

	$effect(() => {
		if (!browser || !navOpen) return;
		function onKey(e: KeyboardEvent): void {
			if (e.key === 'Escape') navOpen = false;
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function closeMobileNav(): void {
		navOpen = false;
	}
</script>

<svelte:head>
	<meta name="description" content={m.meta_description({}, msg)} />
	<link rel="canonical" href={`https://mkk-ev.de${page.url.pathname}`} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- Space for fixed header (language strip + nav + notch safe area) -->
	<div class="mkk-header-scroll-spacer shrink-0" aria-hidden="true"></div>

	<header
		class="mkk-fixed-header-surface fixed top-0 right-0 left-0 z-50 flex flex-col border-b border-red-950/40 pt-[env(safe-area-inset-top,0px)]"
	>
		<div
			class="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top,0px)] h-px bg-linear-to-r from-transparent via-red-600/50 to-transparent"
			aria-hidden="true"
		></div>

		<!-- Language: fixed stack top — always visible while scrolling -->
		<div
			class="flex h-11 max-h-11 min-h-11 w-full items-center border-b border-zinc-800/80 px-3 sm:px-6 lg:pr-2 lg:pl-8 xl:pr-3 xl:pl-10"
		>
			<div
				class="mx-auto flex w-full max-w-6xl items-center justify-end gap-2 lg:mx-0 lg:max-w-none"
			>
				<div
					class="flex min-h-11 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-1 text-xs font-semibold tracking-wide uppercase shadow-inner sm:text-sm"
					role="group"
					aria-label={m.nav_aria_lang({}, msg)}
				>
					<a
						href={deHref}
						class="inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 transition-colors sm:min-w-11 {locale ===
						'de'
							? 'bg-red-950 text-red-100'
							: 'text-zinc-500 hover:text-zinc-200 active:bg-zinc-800'}"
						lang="de"
						title={m.lang_de({}, msg)}
					>
						DE
					</a>
					<a
						href={enHref}
						class="inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 transition-colors sm:min-w-11 {locale ===
						'en'
							? 'bg-red-950 text-red-100'
							: 'text-zinc-500 hover:text-zinc-200 active:bg-zinc-800'}"
						lang="en"
						title={m.lang_en({}, msg)}
					>
						EN
					</a>
				</div>
			</div>
		</div>

		<nav
			class="relative mx-auto w-full max-w-6xl px-3 py-2.5 sm:px-6 sm:py-3 lg:max-w-5xl lg:pr-10 lg:pl-4 xl:max-w-[66rem] xl:pr-12 xl:pl-5"
			aria-label={m.nav_aria_main({}, msg)}
		>
			<div
				class="flex w-full min-w-0 items-center justify-between gap-3 lg:items-center lg:justify-start lg:gap-6"
			>
				<a
					href={homeHref}
					class="flex min-h-11 max-w-[min(70vw,15rem)] shrink-0 items-center rounded-md py-1 sm:max-w-[min(55vw,16rem)] lg:max-w-[18rem] lg:-translate-x-1 xl:-translate-x-2"
					aria-label={m.nav_home({}, msg)}
				>
					<img
						src={brandLogoSrc}
						alt=""
						class="h-8 max-h-10 w-auto object-contain object-left sm:h-9 lg:h-10"
						decoding="async"
					/>
				</a>

				<button
					type="button"
					class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 lg:hidden"
					aria-expanded={navOpen}
					aria-controls="mkk-main-menu"
					aria-label={navOpen ? m.nav_menu_close({}, msg) : m.nav_menu_open({}, msg)}
					onclick={() => (navOpen = !navOpen)}
				>
					{#if navOpen}
						<svg class="size-6" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								d="M6 6 18 18M18 6 6 18"
							/>
						</svg>
					{:else}
						<svg class="size-6" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								d="M5 7h14M5 12h14M5 17h14"
							/>
						</svg>
					{/if}
				</button>

				<div
					class="mkk-nav-entries hidden min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:flex lg:flex-1 lg:justify-center"
				>
					{#each mainNav as item (item.path)}
						<a
							href={item.href}
							class="mkk-nav-entry"
							aria-current={currentPath === item.path ? 'page' : undefined}
						>
							{item.label()}
						</a>
					{/each}
				</div>
			</div>

			<div
				id="mkk-main-menu"
				inert={!navOpen}
				class="absolute inset-x-0 top-full z-60 max-h-[min(70vh,28rem)] overflow-y-auto border-t border-red-950/35 bg-zinc-950 px-2 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:px-3 lg:hidden {!navOpen
					? 'hidden'
					: ''}"
			>
				<div class="flex flex-col gap-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
					{#each mainNav as item (item.path)}
						<a
							href={item.href}
							class="mkk-nav-entry flex w-full justify-start px-4 py-3.5 text-base"
							aria-current={currentPath === item.path ? 'page' : undefined}
							onclick={closeMobileNav}
						>
							{item.label()}
						</a>
					{/each}
				</div>
			</div>
		</nav>
	</header>

	<button
		type="button"
		class="mkk-mobile-nav-backdrop fixed right-0 bottom-0 left-0 z-45 cursor-default border-0 bg-black/60 p-0 lg:hidden {!navOpen
			? 'hidden'
			: ''}"
		style="top: var(--mkk-header-stack)"
		aria-label={m.nav_menu_close({}, msg)}
		onclick={closeMobileNav}
	></button>

	<main class="flex min-h-0 flex-1 flex-col">
		{@render children()}
	</main>

	<footer
		class="mkk-footer-slab mt-auto border-t border-zinc-800/80 bg-zinc-950 bg-[radial-gradient(ellipse_at_bottom,rgba(127,29,29,0.12),transparent_55%)]"
	>
		<div
			class="mx-auto flex max-w-6xl flex-col gap-6 px-3 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6"
		>
			<p class="max-w-md min-w-0 text-sm text-zinc-500">
				<span class="font-display text-lg tracking-wider text-zinc-400 uppercase">
					{m.site_name({}, msg)}
				</span>
				<span class="mt-1 block text-pretty text-zinc-600">{m.footer_tagline({}, msg)}</span>
			</p>
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
				<a
					href={imprintHref}
					class="inline-flex min-h-11 items-center justify-center rounded border border-zinc-700 bg-zinc-900/60 px-4 text-sm font-semibold tracking-wide text-zinc-300 uppercase transition-colors hover:border-red-800/60 hover:bg-red-950/30 hover:text-red-200 active:bg-red-950/50"
				>
					{m.footer_imprint({}, msg)}
				</a>
				<a
					href={privacyHref}
					class="inline-flex min-h-11 items-center justify-center rounded border border-zinc-700 bg-zinc-900/60 px-4 text-sm font-semibold tracking-wide text-zinc-300 uppercase transition-colors hover:border-red-800/60 hover:bg-red-950/30 hover:text-red-200 active:bg-red-950/50"
				>
					{m.footer_privacy({}, msg)}
				</a>
				<button
					type="button"
					class="inline-flex min-h-11 items-center justify-center rounded border border-zinc-700 bg-zinc-900/60 px-4 text-sm font-semibold tracking-wide text-zinc-300 uppercase transition-colors hover:border-red-800/60 hover:bg-red-950/30 hover:text-red-200 active:bg-red-950/50"
					onclick={openCookieSettings}
				>
					{m.footer_cookie_settings({}, msg)}
				</button>
			</div>
		</div>
	</footer>

	<CookieBanner {locale} {privacyHref} />
</div>
