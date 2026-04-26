import { expect, test } from '@playwright/test';

test.describe('MKK site', () => {
	test('root redirects to German home', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/home\/?$/);
		await expect(page.getByRole('heading', { level: 1 })).toContainText(/Metal Kultur Kollektiv/i);
	});

	test('English home lives under /en/home', async ({ page }) => {
		await page.goto('/en/home');
		await expect(page).toHaveURL(/\/en\/home\/?$/);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});

	test('about page renders localized title', async ({ page }) => {
		await page.goto('/about-us');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Über uns/i);
		await page.goto('/en/about-us');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/About Us/i);
	});

	test('metalparty page shows static logo', async ({ page }) => {
		await page.goto('/metalparty-infos');
		const logo = page.locator('main img[src*="logo_metalparty"]');
		await expect(logo).toBeVisible();
	});

	test('language switcher toggles DE / EN for same route', async ({ page }) => {
		await page.goto('/about-us');
		await page.getByRole('link', { name: 'EN', exact: true }).click();
		await expect(page).toHaveURL(/\/en\/about-us\/?$/);
		await page.getByRole('link', { name: 'DE', exact: true }).click();
		await expect(page).toHaveURL(/\/about-us\/?$/);
	});

	test('main nav keeps English locale after switching from German home', async ({ page }) => {
		await page.goto('/home');
		await page.getByRole('link', { name: 'EN', exact: true }).click();
		await expect(page).toHaveURL(/\/en\/home\/?$/);
		await page
			.getByRole('navigation', { name: /Main navigation|Hauptnavigation/i })
			.getByRole('link', { name: 'About Us', exact: true })
			.click();
		await expect(page).toHaveURL(/\/en\/about-us\/?$/);
	});

	test('cookie banner can be dismissed with Necessary only', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.removeItem('mkk.cookieConsent');
		});
		await page.goto('/home');
		const notice = page.getByRole('region', { name: /Cookie|Einwilligung|consent/i });
		await expect(notice).toBeVisible({ timeout: 15_000 });
		await page.getByRole('button', { name: /Nur notwendige|Necessary only/i }).click();
		await expect(notice).toBeHidden();
	});
});
