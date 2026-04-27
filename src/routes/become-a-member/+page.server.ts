import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types.js';

function trim(data: FormData, key: string): string {
	return String(data.get(key) ?? '').trim();
}

function validEmail(s: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** ISO date yyyy-mm-dd, not in the future */
function reasonableBirthdate(s: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
	const d = new Date(s + 'T12:00:00');
	if (Number.isNaN(d.getTime())) return false;
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	return d <= today;
}

export const actions = {
	apply: async ({ request }) => {
		const data = await request.formData();
		const firstName = trim(data, 'firstName');
		const lastName = trim(data, 'lastName');
		const birthdate = trim(data, 'birthdate');
		const street = trim(data, 'street');
		const zip = trim(data, 'zip');
		const city = trim(data, 'city');
		const email = trim(data, 'email');
		const phone = trim(data, 'phone');
		const message = trim(data, 'message');
		const acceptStatutes = data.get('acceptStatutes') === 'on';
		const acceptPrivacy = data.get('acceptPrivacy') === 'on';

		const values = {
			firstName,
			lastName,
			birthdate,
			street,
			zip,
			city,
			email,
			phone,
			message
		};

		const errors: Record<string, boolean> = {};
		if (!firstName) errors.firstName = true;
		if (!lastName) errors.lastName = true;
		if (!birthdate || !reasonableBirthdate(birthdate)) errors.birthdate = true;
		if (!street) errors.street = true;
		if (!zip) errors.zip = true;
		if (!city) errors.city = true;
		if (!email || !validEmail(email)) errors.email = true;
		if (!acceptStatutes) errors.acceptStatutes = true;
		if (!acceptPrivacy) errors.acceptPrivacy = true;

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values });
		}

		const payload = {
			firstName,
			lastName,
			birthdate,
			street,
			zip,
			city,
			email,
			phone: phone || null,
			message: message || null,
			submittedAt: new Date().toISOString()
		};

		const locale = trim(data, 'locale') === 'en' ? 'en' : 'de';

		const webhook = env.MEMBERSHIP_APPLICATION_WEBHOOK_URL;
		if (webhook) {
			try {
				const res = await fetch(webhook, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...payload, locale })
				});
				if (!res.ok) return fail(502, { errors: {}, values, remoteError: true });
			} catch {
				return fail(502, { errors: {}, values, remoteError: true });
			}
			return { success: true as const, mode: 'webhook' as const };
		}

		const inbound = env.MEMBERSHIP_INBOUND_EMAIL ?? 'jens.schehlmann@googlemail.com';
		const subject =
			locale === 'en'
				? encodeURIComponent(`Membership application: ${firstName} ${lastName}`)
				: encodeURIComponent(`Mitgliedsantrag: ${firstName} ${lastName}`);
		const body = encodeURIComponent(
			(locale === 'en'
				? [
						'Membership application (website)',
						'',
						`Name: ${firstName} ${lastName}`,
						`Date of birth: ${birthdate}`,
						`Address: ${street}, ${zip} ${city}`,
						`Email: ${email}`,
						`Phone: ${phone || '-'}`,
						'',
						`Message / motivation:`,
						message || '-'
					]
				: [
						'Mitgliedsantrag (Website)',
						'',
						`Name: ${firstName} ${lastName}`,
						`Geburtsdatum: ${birthdate}`,
						`Adresse: ${street}, ${zip} ${city}`,
						`E-Mail: ${email}`,
						`Telefon: ${phone || '-'}`,
						'',
						`Nachricht / Motivation:`,
						message || '-'
					]
			).join('\n')
		);
		const mailtoHref = `mailto:${inbound}?subject=${subject}&body=${body}`;

		return { success: true as const, mode: 'mailto' as const, mailtoHref };
	}
} satisfies Actions;
