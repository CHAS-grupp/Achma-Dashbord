import { test, expect } from '@playwright/test';

test('page loading', async ({ page }) => {
  await page.goto('https://localhost:3000');
  const title = await page.title();
  expect(title).toBe('Acme');
});
