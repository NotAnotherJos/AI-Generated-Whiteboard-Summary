import { test, expect } from '@playwright/test';

const APP_IFRAME = 'iframe[data-testid="hosted-resources-iframe"]';
const LANG_BUTTON_NAME_RE = /^(Lang|语言|言語|lingua|langue|Idioma)$/i;

const LANG_CASES: { menu: string; btn: RegExp }[] = [
  { menu: 'English',   btn: /^Lang$/i },
  { menu: '简体中文',   btn: /^语言$/ },
  { menu: '日本語',     btn: /^(言語)$/ },
  { menu: 'Italiano',  btn: /^lingua$/i },
  { menu: 'Français',  btn: /^langue$/i },
  { menu: 'Español',   btn: /^Idioma$/i },
];

test.describe('Language switching', () => {
  test('open app -> click Lang -> iterate all languages and assert button label', async ({ page }) => {
    await page.goto(process.env.APP_URL!, { waitUntil: 'networkidle' });
    await page.locator(APP_IFRAME).first().waitFor({ timeout: 30000 });
    const app = page.frameLocator(APP_IFRAME);

    const langButton = () => app.getByRole('button', { name: LANG_BUTTON_NAME_RE }).first();
    await expect(langButton()).toBeVisible({ timeout: 60000 });

    for (const { menu, btn } of LANG_CASES) {
      await langButton().click();
      const menuList = app.getByRole('menu');
      await expect(menuList).toBeVisible({ timeout: 10000 });
      await app.getByRole('menuitem', { name: new RegExp(`^${menu}$`) }).click();
      await expect(langButton()).toHaveText(btn, { timeout: 10000 });
    }
  });
});
