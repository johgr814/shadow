import { expect, test } from '@playwright/test';

test('renders app title on index page', async ({ page }) => {
  page.on('console', (message) => {
    console.log(`[DEBUG_LOG] browser:${message.type()}: ${message.text()}`);
  });

  await page.goto('/');

  await expect(page).toHaveTitle('Shadow');
  await expect(page.locator('#app-title')).toHaveText(
    'Shadow Configuration Server',
  );
});
