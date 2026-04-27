<script lang="ts">
	// import { base } from '$app/paths';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { localeFromPathname } from '$lib/locale-from-path.js';

	const locale = $derived(localeFromPathname(page.url.pathname));
	const msg = $derived({ locale } as const);
</script>

<svelte:head>
	<title>{m.site_name({}, msg)} — {m.nav_home({}, msg)}</title>
</svelte:head>

<section
	class="relative overflow-hidden border-b border-red-950/30 bg-linear-to-b from-zinc-900 via-zinc-950 to-zinc-950"
	aria-labelledby="hero-heading"
>
	<div
		class="pointer-events-none absolute top-0 -left-1/4 hidden h-72 w-72 rounded-full bg-red-600/10 blur-3xl md:block md:h-112 md:w-md"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-1/4 bottom-0 hidden h-64 w-64 rounded-full bg-red-900/10 blur-3xl md:block md:h-88 md:w-88"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto max-w-4xl px-3 py-16 text-center sm:px-6 sm:py-24 md:py-32">
		<p
			class="mb-4 font-display text-xs tracking-[0.28em] text-red-500/90 uppercase sm:text-sm sm:tracking-[0.35em] md:text-base"
		>
			{m.hero_ev({}, msg)}
		</p>
		<h1
			id="hero-heading"
			class="px-1 font-display text-[clamp(2rem,9vw,2.75rem)] leading-[1.05] tracking-wide text-balance wrap-break-word text-zinc-50 uppercase drop-shadow-[0_0_40px_rgba(185,28,28,0.35)] sm:text-6xl sm:leading-none md:text-7xl lg:text-8xl"
		>
			{m.hero_title({}, msg)}
		</h1>
		<p
			class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-zinc-400 sm:mt-8 sm:text-lg md:text-xl"
		>
			{m.hero_subtitle({}, msg)}
		</p>
		<p class="mt-10 text-sm text-zinc-600">
			{m.hero_hint({}, msg)}
		</p>
	</div>
</section>
