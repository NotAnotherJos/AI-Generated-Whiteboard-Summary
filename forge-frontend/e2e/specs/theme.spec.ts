import { test, expect } from '@playwright/test';

const APP_IFRAME = 'iframe[data-testid="hosted-resources-iframe"]';
const THEMES = ['Space', 'Sea', 'Clouds', 'R-G Colorblind'];

test.describe('Theme switching (smoke, then open account menu and choose dark)', () => {
  test('iterate themes, open account menu, open theme switcher, choose dark, wait 1s', async ({ page }) => {
    await page.goto(process.env.APP_URL!, { waitUntil: 'networkidle' });
    await page.locator(APP_IFRAME).first().waitFor({ timeout: 30000 });
    const app = page.frameLocator(APP_IFRAME);

    const themeButton = () => app.getByRole('button', { name: /Theme/i }).first();
    await expect(themeButton()).toBeVisible({ timeout: 30000 });

    for (const name of THEMES) {
      await themeButton().click();
      await app.getByRole('menu').first().waitFor({ state: 'visible', timeout: 10000 });
      await app.getByRole('menuitem', { name }).first().click();
      await page.waitForTimeout(1000);
    }
    await page.waitForTimeout(1000);
  });
});
