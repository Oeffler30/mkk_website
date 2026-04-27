<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		markCookieBannerDismissedThisSession,
		wasCookieBannerDismissedThisSession
	} from '$lib/cookie-consent-banner-session.js';
	import { readConsent, writeConsent, type StoredConsent } from '$lib/cookie-consent-storage.js';
	import { registerCookieSettingsOpener } from '$lib/cookie-consent-ui.js';

	let { locale, privacyHref }: { locale: 'de' | 'en'; privacyHref: string } = $props();

	const msg = $derived({ locale } as const);

	let consentKnown = $state(false);
	/** User has saved a choice (banner strip hidden). */
	let decided = $state(false);
	/** Custom settings panel (replaces <dialog> so the whole UI toggles together reliably). */
	let settingsOpen = $state(false);

	let draftFunctional = $state(false);
	let draftAnalytics = $state(false);
	let draftMarketing = $state(false);

	const showBannerStrip = $derived(Boolean(consentKnown && !decided));

	function syncDraftFromStorage(): void {
		const stored = readConsent();
		draftFunctional = stored?.functional ?? false;
		draftAnalytics = stored?.analytics ?? false;
		draftMarketing = stored?.marketing ?? false;
	}

	function dismissSettings(): void {
		settingsOpen = false;
	}

	function openManage(): void {
		syncDraftFromStorage();
		settingsOpen = true;
	}

	function persist(partial: Pick<StoredConsent, 'functional' | 'analytics' | 'marketing'>): void {
		markCookieBannerDismissedThisSession();
		writeConsent(partial);
		decided = true;
		dismissSettings();
	}

	function acceptAll(): void {
		persist({ functional: true, analytics: true, marketing: true });
	}

	function onlyNecessary(): void {
		persist({ functional: false, analytics: false, marketing: false });
	}

	function saveCustom(): void {
		persist({
			functional: draftFunctional,
			analytics: draftAnalytics,
			marketing: draftMarketing
		});
	}

	function cancelDialog(): void {
		dismissSettings();
		syncDraftFromStorage();
	}

	onMount(() => {
		decided = wasCookieBannerDismissedThisSession() || !!readConsent();
		consentKnown = true;
		return registerCookieSettingsOpener(openManage);
	});

	$effect(() => {
		if (!browser) return;
		document.documentElement.classList.toggle('mkk-cookie-settings-open', settingsOpen);
		return () => document.documentElement.classList.remove('mkk-cookie-settings-open');
	});

	$effect(() => {
		if (!browser || !settingsOpen) return;
		function onKey(e: KeyboardEvent): void {
			if (e.key === 'Escape') cancelDialog();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<!-- Bottom consent strip -->
<div
	class="cookie-banner-strip fixed right-0 bottom-0 left-0 z-70 border-t border-red-950/50 bg-zinc-950/98 px-3 py-4 shadow-[0_-8px_40px_rgba(0,0,0,0.55)] sm:px-6 sm:py-5"
	hidden={!showBannerStrip}
	role="region"
	aria-label={m.cookie_banner_aria({}, msg)}
>
	<div
		class="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
	>
		<div class="min-w-0 flex-1 text-sm leading-relaxed text-zinc-300">
			<h2 class="font-display text-xl tracking-wide text-zinc-100 uppercase">
				{m.cookie_banner_title({}, msg)}
			</h2>
			<p class="mt-2 text-pretty text-zinc-400">
				{m.cookie_banner_lead({}, msg)}
				<a
					class="mkk-cursor-metal font-medium text-red-400 underline decoration-red-500/50 underline-offset-2 hover:text-red-300"
					href={privacyHref}>{m.footer_privacy({}, msg)}</a
				>.
				{m.cookie_banner_more({}, msg)}
			</p>
		</div>
		<div
			class="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
		>
			<button
				type="button"
				class="mkk-cursor-metal inline-flex min-h-11 items-center justify-center rounded border border-red-800/60 bg-red-950/50 px-4 text-sm font-semibold tracking-wide text-red-100 uppercase transition-colors hover:bg-red-900/60"
				onclick={acceptAll}
			>
				{m.cookie_accept_all({}, msg)}
			</button>
			<button
				type="button"
				class="mkk-cursor-metal inline-flex min-h-11 items-center justify-center rounded border border-zinc-600 bg-zinc-900 px-4 text-sm font-semibold tracking-wide text-zinc-200 uppercase transition-colors hover:border-zinc-500 hover:bg-zinc-800"
				onclick={onlyNecessary}
			>
				{m.cookie_only_necessary({}, msg)}
			</button>
			<button
				type="button"
				class="mkk-cursor-metal inline-flex min-h-11 items-center justify-center rounded border border-zinc-700 px-4 text-sm font-semibold tracking-wide text-zinc-300 uppercase transition-colors hover:border-red-900/40 hover:bg-zinc-900"
				onclick={openManage}
			>
				{m.cookie_manage({}, msg)}
			</button>
		</div>
	</div>
</div>

<!-- Full settings overlay: one `hidden` toggles backdrop + panel + all controls together -->
<div
	class="mkk-cookie-settings-overlay fixed inset-0 z-80 flex flex-col items-center justify-center p-4"
	hidden={!settingsOpen}
	aria-hidden={!settingsOpen}
>
	<!-- Backdrop: click = same as Cancel -->
	<button
		type="button"
		class="absolute inset-0 z-0 cursor-default border-0 bg-black/65"
		tabindex="-1"
		onclick={cancelDialog}
		aria-label={m.cookie_cancel({}, msg)}
	></button>

	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="cookie-dialog-title"
		tabindex="-1"
		class="relative z-10 flex max-h-[min(90dvh,40rem)] w-full max-w-lg flex-col overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-200 shadow-2xl ring-0 outline-none focus:outline-none"
	>
		<div class="border-b border-zinc-800 px-5 py-4">
			<h2
				id="cookie-dialog-title"
				class="font-display text-2xl tracking-wide text-zinc-50 uppercase"
			>
				{m.cookie_dialog_title({}, msg)}
			</h2>
			<p class="mt-2 text-sm leading-relaxed text-zinc-400">
				{m.cookie_dialog_intro({}, msg)}
			</p>
		</div>

		<div class="flex flex-col gap-5 px-5 py-4">
			<div class="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
				<div class="flex items-start gap-3">
					<input
						id="cookie-nec"
						type="checkbox"
						checked
						disabled
						class="mt-1 size-4 shrink-0 rounded border-zinc-600 text-red-600"
					/>
					<div class="min-w-0">
						<label class="font-semibold text-zinc-200" for="cookie-nec"
							>{m.cookie_cat_necessary_title({}, msg)}</label
						>
						<p class="mt-1 text-sm text-zinc-500">{m.cookie_cat_necessary_desc({}, msg)}</p>
					</div>
				</div>
			</div>

			<div class="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
				<div class="flex items-start gap-3">
					<input
						id="cookie-fn"
						type="checkbox"
						bind:checked={draftFunctional}
						class="mt-1 size-4 shrink-0 rounded border-zinc-600 text-red-600 focus:ring-red-500"
					/>
					<div class="min-w-0">
						<label class="font-semibold text-zinc-200" for="cookie-fn"
							>{m.cookie_cat_functional_title({}, msg)}</label
						>
						<p class="mt-1 text-sm text-zinc-500">{m.cookie_cat_functional_desc({}, msg)}</p>
					</div>
				</div>
			</div>

			<div class="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
				<div class="flex items-start gap-3">
					<input
						id="cookie-an"
						type="checkbox"
						bind:checked={draftAnalytics}
						class="mt-1 size-4 shrink-0 rounded border-zinc-600 text-red-600 focus:ring-red-500"
					/>
					<div class="min-w-0">
						<label class="font-semibold text-zinc-200" for="cookie-an"
							>{m.cookie_cat_analytics_title({}, msg)}</label
						>
						<p class="mt-1 text-sm text-zinc-500">{m.cookie_cat_analytics_desc({}, msg)}</p>
					</div>
				</div>
			</div>

			<div class="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
				<div class="flex items-start gap-3">
					<input
						id="cookie-mk"
						type="checkbox"
						bind:checked={draftMarketing}
						class="mt-1 size-4 shrink-0 rounded border-zinc-600 text-red-600 focus:ring-red-500"
					/>
					<div class="min-w-0">
						<label class="font-semibold text-zinc-200" for="cookie-mk"
							>{m.cookie_cat_marketing_title({}, msg)}</label
						>
						<p class="mt-1 text-sm text-zinc-500">{m.cookie_cat_marketing_desc({}, msg)}</p>
					</div>
				</div>
			</div>
		</div>

		<div
			class="flex flex-col-reverse gap-2 border-t border-zinc-800 px-5 py-4 sm:flex-row sm:justify-end"
		>
			<button
				type="button"
				class="mkk-cursor-metal inline-flex min-h-11 items-center justify-center rounded border border-zinc-600 px-4 text-sm font-semibold text-zinc-300 uppercase hover:bg-zinc-900"
				onclick={cancelDialog}
			>
				{m.cookie_cancel({}, msg)}
			</button>
			<button
				type="button"
				class="mkk-cursor-metal inline-flex min-h-11 items-center justify-center rounded border border-red-800/60 bg-red-950/50 px-4 text-sm font-semibold tracking-wide text-red-100 uppercase hover:bg-red-900/60"
				onclick={saveCustom}
			>
				{m.cookie_save({}, msg)}
			</button>
		</div>
	</div>
</div>

<style>
	:global(html.mkk-cookie-settings-open) {
		overflow: hidden;
	}
</style>
