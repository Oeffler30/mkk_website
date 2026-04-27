<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { absSveltePath } from '$lib/app-resolve.js';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	type FormShape = {
		errors?: Record<string, boolean>;
		values?: {
			firstName?: string;
			lastName?: string;
			birthdate?: string;
			street?: string;
			zip?: string;
			city?: string;
			email?: string;
			phone?: string;
			message?: string;
		};
		success?: boolean;
		mode?: 'webhook' | 'mailto';
		mailtoHref?: string;
		remoteError?: boolean;
	};

	let {
		form = null,
		msg
	}: {
		form: FormShape | null | undefined;
		msg: { locale: 'de' | 'en' };
	} = $props();

	const privacyHref = $derived(
		resolve(absSveltePath(localizeHref('/datenschutz', { locale: msg.locale })) as Pathname)
	);

	const inputClass =
		'mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-zinc-100 shadow-sm transition-colors placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-900/60';
	const inputError = 'border-red-700 bg-red-950/30';
	const inputOk = 'border-zinc-700 bg-zinc-900';

	function fieldClass(name: keyof NonNullable<FormShape['errors']>): string {
		const err = form?.errors?.[name];
		return `${inputClass} ${err ? inputError : inputOk}`;
	}
</script>

{#if form?.success && form.mode === 'webhook'}
	<div
		class="rounded-lg border border-emerald-900/60 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100"
		role="status"
	>
		{m.members_form_success_webhook({}, msg)}
	</div>
{:else if form?.success && form.mode === 'mailto' && form.mailtoHref}
	<div
		class="rounded-lg border border-emerald-900/60 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100"
		role="status"
	>
		<p class="font-medium">{m.members_form_success_mailto_title({}, msg)}</p>
		<p class="mt-2 text-emerald-200/90">{m.members_form_success_mailto_hint({}, msg)}</p>
		<p class="mt-4">
			<button
				type="button"
				class="inline-flex items-center rounded-md bg-emerald-900/50 px-3 py-2 text-sm font-semibold text-emerald-50 underline-offset-4 hover:bg-emerald-900/70 hover:underline"
				onclick={() => {
					if (form?.mailtoHref) window.location.href = form.mailtoHref;
				}}
			>
				{m.members_form_open_mail({}, msg)}
			</button>
		</p>
	</div>
{:else}
	{#if form?.remoteError}
		<div class="mb-6 rounded-lg border border-red-900/60 bg-red-950/35 px-4 py-3 text-sm text-red-100" role="alert">
			{m.members_form_error_remote({}, msg)}
		</div>
	{/if}

	<form method="POST" action="?/apply" class="space-y-6">
		<input type="hidden" name="locale" value={msg.locale} />

		<div class="grid gap-6 sm:grid-cols-2">
			<div>
				<label class="block text-sm font-medium text-zinc-300" for="firstName">{m.members_field_first_name({}, msg)}</label>
				<input
					id="firstName"
					name="firstName"
					type="text"
					autocomplete="given-name"
					required
					value={form?.values?.firstName ?? ''}
					class={fieldClass('firstName')}
				/>
				{#if form?.errors?.firstName}
					<p class="mt-1 text-xs text-red-400">{m.members_error_required({}, msg)}</p>
				{/if}
			</div>
			<div>
				<label class="block text-sm font-medium text-zinc-300" for="lastName">{m.members_field_last_name({}, msg)}</label>
				<input
					id="lastName"
					name="lastName"
					type="text"
					autocomplete="family-name"
					required
					value={form?.values?.lastName ?? ''}
					class={fieldClass('lastName')}
				/>
				{#if form?.errors?.lastName}
					<p class="mt-1 text-xs text-red-400">{m.members_error_required({}, msg)}</p>
				{/if}
			</div>
		</div>

		<div class="sm:max-w-xs">
			<label class="block text-sm font-medium text-zinc-300" for="birthdate">{m.members_field_birthdate({}, msg)}</label>
			<input
				id="birthdate"
				name="birthdate"
				type="date"
				required
				max={new Date().toISOString().slice(0, 10)}
				value={form?.values?.birthdate ?? ''}
				class={fieldClass('birthdate')}
			/>
			{#if form?.errors?.birthdate}
				<p class="mt-1 text-xs text-red-400">{m.members_error_birthdate({}, msg)}</p>
			{/if}
		</div>

		<div>
			<label class="block text-sm font-medium text-zinc-300" for="street">{m.members_field_street({}, msg)}</label>
			<input
				id="street"
				name="street"
				type="text"
				autocomplete="street-address"
				required
				value={form?.values?.street ?? ''}
				class={fieldClass('street')}
			/>
			{#if form?.errors?.street}
				<p class="mt-1 text-xs text-red-400">{m.members_error_required({}, msg)}</p>
			{/if}
		</div>

		<div class="grid gap-6 sm:grid-cols-3">
			<div class="sm:col-span-1">
				<label class="block text-sm font-medium text-zinc-300" for="zip">{m.members_field_zip({}, msg)}</label>
				<input
					id="zip"
					name="zip"
					type="text"
					autocomplete="postal-code"
					required
					value={form?.values?.zip ?? ''}
					class={fieldClass('zip')}
				/>
				{#if form?.errors?.zip}
					<p class="mt-1 text-xs text-red-400">{m.members_error_required({}, msg)}</p>
				{/if}
			</div>
			<div class="sm:col-span-2">
				<label class="block text-sm font-medium text-zinc-300" for="city">{m.members_field_city({}, msg)}</label>
				<input
					id="city"
					name="city"
					type="text"
					autocomplete="address-level2"
					required
					value={form?.values?.city ?? ''}
					class={fieldClass('city')}
				/>
				{#if form?.errors?.city}
					<p class="mt-1 text-xs text-red-400">{m.members_error_required({}, msg)}</p>
				{/if}
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-zinc-300" for="email">{m.members_field_email({}, msg)}</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				inputmode="email"
				value={form?.values?.email ?? ''}
				class={fieldClass('email')}
			/>
			{#if form?.errors?.email}
				<p class="mt-1 text-xs text-red-400">{m.members_error_email({}, msg)}</p>
			{/if}
		</div>

		<div>
			<label class="block text-sm font-medium text-zinc-300" for="phone">{m.members_field_phone({}, msg)}</label>
			<input
				id="phone"
				name="phone"
				type="tel"
				autocomplete="tel"
				value={form?.values?.phone ?? ''}
				class="{inputClass} {inputOk}"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-zinc-300" for="message">{m.members_field_message({}, msg)}</label>
			<textarea id="message" name="message" rows="4" class="{inputClass} {inputOk}">{form?.values?.message ?? ''}</textarea>
		</div>

		<fieldset class="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
			<legend class="sr-only">{m.members_legal_legend({}, msg)}</legend>
			<label class="flex gap-3 text-sm leading-snug text-zinc-300">
				<input
					type="checkbox"
					name="acceptStatutes"
					required
					class="mt-1 size-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-red-600 focus:ring-red-700"
				/>
				<span>
					{m.members_accept_statutes({}, msg)}
					<span class="mt-1 block text-xs text-zinc-500">{m.members_accept_statutes_note({}, msg)}</span>
				</span>
			</label>
			{#if form?.errors?.acceptStatutes}
				<p class="text-xs text-red-400">{m.members_error_accept_statutes({}, msg)}</p>
			{/if}

			<label class="flex gap-3 text-sm leading-snug text-zinc-300">
				<input
					type="checkbox"
					name="acceptPrivacy"
					required
					class="mt-1 size-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-red-600 focus:ring-red-700"
				/>
				<span>
					{m.members_accept_privacy_lead({}, msg)}
					<a class="text-red-400 underline-offset-2 hover:text-red-300 hover:underline" href={privacyHref}
						>{m.members_accept_privacy_link({}, msg)}</a>{m.members_accept_privacy_tail({}, msg)}
				</span>
			</label>
			{#if form?.errors?.acceptPrivacy}
				<p class="text-xs text-red-400">{m.members_error_accept_privacy({}, msg)}</p>
			{/if}
		</fieldset>

		<p class="text-xs leading-relaxed text-zinc-500">{m.members_form_notice({}, msg)}</p>

		<button
			type="submit"
			class="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-950 px-6 py-2.5 text-sm font-semibold tracking-wide text-red-50 uppercase shadow-[inset_0_0_0_1px_rgb(127_29_29/0.55)] transition-colors hover:bg-red-900 active:bg-red-950"
		>
			{m.members_submit({}, msg)}
		</button>
	</form>
{/if}
