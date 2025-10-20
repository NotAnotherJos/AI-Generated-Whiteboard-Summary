import { test, expect } from '@playwright/test';
import path from 'path';

const APP_IFRAME = 'iframe[data-testid="hosted-resources-iframe"]';
const TARGET_URL_RE = /^https:\/\/ai-whiteboard\.atlassian\.net\/wiki\/spaces\/Presentati\/pages\//;
const SAMPLE_IMG = path.resolve('e2e', 'images', 'table.jpg');

test.describe('AI Whiteboard - Main Flow (upload -> parse -> open new page)', () => {
  test('Upload sample image -> set options -> wait result -> Go new Page', async ({ page }) => {
    await page.goto(process.env.APP_URL!, { waitUntil: 'networkidle' });

    await page.locator(APP_IFRAME).first().waitFor({ timeout: 15000 });
    const app = page.frameLocator(APP_IFRAME);

    await app.locator('[aria-label="AI models for analysis"] [role="combobox"]').first().click();
    await app.getByRole('option', { name: /gpt-4\.1-nano/i }).click();

    await app.locator('[aria-label="Analysis type for different scenarios"] [role="combobox"]').first().click();
    await app.getByRole('option', { name: /concise/i }).click();

    await app.getByPlaceholder(/eg\. analyze the image/i).first().fill('give me the result in french');

    const fileInput = app.locator('input#file-upload, input[type="file"]').first();
    await fileInput.setInputFiles(SAMPLE_IMG);

    const goNewPageBtn = app.getByRole('button', { name: /go new page/i });
    await goNewPageBtn.waitFor({ state: 'visible', timeout: 60000 });

    const deadline = Date.now() + 10000;
    while (Date.now() < deadline && (await goNewPageBtn.isDisabled().catch(() => false))) {
      await page.waitForTimeout(200);
    }

    await goNewPageBtn.click();

    const popup = await page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);

    if (popup) {
      await popup.waitForURL(TARGET_URL_RE, { timeout: 30000 });
      await popup.waitForTimeout(2000);
    } else {
      await page.waitForURL(TARGET_URL_RE, { timeout: 30000 });
      await page.waitForTimeout(2000);
    }
  });
});
