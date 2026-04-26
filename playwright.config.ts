import { defineConfig } from '@playwright/test';

const previewOrigin = 'http://localhost:4173';

export default defineConfig({
	testDir: 'tests',
	testMatch: '**/*.e2e.{ts,js}',
	use: {
		baseURL: previewOrigin
	},
	webServer: {
		command: 'npm run build && npm run preview',
		url: previewOrigin,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
