import { test, expect } from '@playwright/test';

const APP_IFRAME = 'iframe[data-testid="hosted-resources-iframe"]';

test.describe('Help wizard: open → next → finish', () => {
  test('click Help, go through steps, then Finish', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(process.env.APP_URL!, { waitUntil: 'networkidle' });

    await page.locator(APP_IFRAME).first().waitFor({ timeout: 30000 });
    const app = page.frameLocator(APP_IFRAME);

    const helpBtnCandidates = [
      app.getByRole('button', { name: /^Help$/ }).first(),
      app.locator('button:has-text("Help")').first(),
    ];
    let helpBtn = null as ReturnType<typeof app.locator> | null;
    for (const c of helpBtnCandidates) {
      if ((await c.count()) && (await c.isVisible().catch(() => false))) { helpBtn = c; break; }
    }
    expect(helpBtn, 'Help button not found').not.toBeNull();
    await helpBtn!.click();

    const startTutorialBtn = app.getByRole('button', { name: /start tutorial/i }).first();
    if (await startTutorialBtn.count()) {
      await startTutorialBtn.dispatchEvent('click');
      await page.waitForTimeout(500);
    }

    for (let i = 0; i < 10; i++) {
      const nextBtn = app.getByRole('button', { name: /^Next$/ }).first();
    
        if (!(await nextBtn.count())) break;
    
        await nextBtn.dispatchEvent('click'); 
        await page.waitForTimeout(300); 
    }
    
    const finishBtnCandidates = [
      app.locator('[data-test-id="button-primary"][aria-label="Finish"]').first(),
      app.getByRole('button', { name: /^Finish$/ }).first(),
      app.locator('button[title="Finish"]').first(),
    ];
    let finish = null as ReturnType<typeof app.locator> | null;
    for (const c of finishBtnCandidates) {
      if ((await c.count()) && (await c.isVisible().catch(() => false))) { finish = c; break; }
    }
    expect(finish, 'Finish button not found').not.toBeNull();
    await finish!.click();

    await page.waitForTimeout(500);
  });
});
