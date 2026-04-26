<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { localeFromPathname } from '$lib/locale-from-path.js';

	const locale = $derived(localeFromPathname(page.url.pathname, base));
	const msg = $derived({ locale } as const);
</script>

<svelte:head>
	<title>{m.page_about_title({}, msg)} — {m.site_name({}, msg)}</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-3 py-12 sm:px-6 sm:py-20">
	<h1
		class="font-display text-[clamp(1.75rem,6vw,3rem)] tracking-wide text-balance wrap-break-word text-zinc-50 uppercase sm:text-5xl"
	>
		{m.page_about_title({}, msg)}
	</h1>
	<div
		class="prose mt-8 max-w-none prose-invert prose-red prose-p:text-pretty prose-p:text-zinc-400"
	>
		<p>{m.page_about_body({}, msg)}</p>
	</div>
</div>
