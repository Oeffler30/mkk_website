<script lang="ts">
	// import { base } from '$app/paths';
	import { page } from '$app/state';
	import PrivacyPolicyDE from '$lib/components/privacy-policy/PrivacyPolicyDE.svelte';
	import PrivacyPolicyEN from '$lib/components/privacy-policy/PrivacyPolicyEN.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localeFromPathname } from '$lib/locale-from-path.js';

	const locale = $derived(localeFromPathname(page.url.pathname));
	const msg = $derived({ locale } as const);
</script>

<svelte:head>
	<title>{m.privacy_title({}, msg)} — {m.site_name({}, msg)}</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-3 py-12 sm:px-6 sm:py-20">
	<h1
		class="font-display text-[clamp(1.75rem,6vw,3rem)] tracking-wide text-balance wrap-break-word text-zinc-50 uppercase sm:text-5xl"
	>
		{m.privacy_title({}, msg)}
	</h1>
	<div class="mt-10">
		{#if locale === 'de'}
			<PrivacyPolicyDE />
		{:else}
			<PrivacyPolicyEN />
		{/if}
	</div>
</div>
