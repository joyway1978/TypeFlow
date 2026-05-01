import { test, expect } from '@playwright/test';

test.describe('Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads and displays title', async ({ page }) => {
    await expect(page).toHaveTitle(/TypeFlow/);
    await expect(page.getByText('TypeFlow')).toBeVisible();
  });

  test('shows listening phase', async ({ page }) => {
    await expect(page.getByText('重听')).toBeVisible();
  });

  test('can toggle applause sound', async ({ page }) => {
    const applauseButton = page.getByRole('button', { name: /👏|🔇/ });
    await expect(applauseButton).toBeVisible();
    await applauseButton.click();
    await expect(applauseButton).toBeVisible();
  });
});
