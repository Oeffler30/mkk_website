<script lang="ts">
	// import { base } from '$app/paths';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { localeFromPathname } from '$lib/locale-from-path.js';

	const locale = $derived(localeFromPathname(page.url.pathname));
	const msg = $derived({ locale } as const);

	const metalpartyLogoSrc = $derived(`/logo_metalparty.png`);
</script>

<svelte:head>
	<title>{m.page_metalparty_title({}, msg)} — {m.site_name({}, msg)}</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-3 py-12 sm:px-6 sm:py-20">
	<h1
		class="font-display text-[clamp(1.75rem,6vw,3rem)] tracking-wide text-balance wrap-break-word text-zinc-50 uppercase sm:text-5xl"
	>
		{m.page_metalparty_title({}, msg)}
	</h1>

	<figure class="mt-8 flex justify-center">
		<img
			src={metalpartyLogoSrc}
			alt={m.page_metalparty_logo_alt({}, msg)}
			class="h-auto w-full max-w-2xl object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
			decoding="async"
		/>
	</figure>

	<div
		class="prose mt-8 max-w-none prose-invert prose-red prose-p:text-pretty prose-p:text-zinc-400"
	>
		<p>{m.page_metalparty_body({}, msg)}</p>
	</div>
</div>
