import { test, expect, Locator, Page, BrowserContext } from '@playwright/test';
import { getGmailCode } from '../utils/gmail.js';
import { AppPage } from '../pages/AppPage';

const { APP_URL, E2E_USER, E2E_PASS } = process.env;

const URL_AFTER_OTP_RE = /(?:SetCST|join\/user-access|login\/authorize|atlassian\.net\/wiki|\/wiki\/|\/apps\/)/i;

async function waitForOneOf(page: Page, candidates: Locator[], timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const c of candidates) {
      try {
        if (await c.isVisible()) return c;
      } catch {}
    }
    await page.waitForTimeout(200);
  }
  return null;
}

async function navigateToApp(page: Page) {
  const iframe = page.locator('iframe[data-testid="hosted-resources-iframe"]').first();
  if (page.url().startsWith(APP_URL!)) {
    await iframe.waitFor({ timeout: 30000 });
    return;
  }
  await page.goto(APP_URL!, { waitUntil: 'domcontentloaded' });
  await iframe.waitFor({ timeout: 30000 });
}

type AuthOutcome =
  | { kind: 'wiki'; page: Page }
  | { kind: 'logged'; page: Page }
  | { kind: 'verification'; page: Page }
  | { kind: 'appframe'; page: Page }
  | { kind: 'unknown'; page: Page };

function getConfluencePage(context: BrowserContext): Page {
  const pages = context.pages().slice().reverse();
  return (
    pages.find(p => /:\/\/[^/]*atlassian\.net\/wiki/i.test(p.url())) ??
    pages.find(p => /atlassian\.net/i.test(p.url())) ??
    pages[0]
  );
}

async function detectAuthOutcome(page: Page, context: BrowserContext, timeout = 60000): Promise<AuthOutcome> {
  let cur: Page = page;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const popup = await context.waitForEvent('page', { timeout: 500 }).catch(() => null);
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      cur = popup;
    }

    const appFrame = cur.locator('iframe[data-testid="hosted-resources-iframe"]').first();
    if (cur.url().startsWith(APP_URL!) || (await appFrame.isVisible().catch(() => false))) {
      return { kind: 'appframe', page: cur };
    }

    if (/atlassian\.net\/wiki/i.test(cur.url())) return { kind: 'wiki', page: cur };

    const avatar = cur.getByRole('img', { name: /^Account$/i }).first();
    if (await avatar.isVisible().catch(() => false)) return { kind: 'logged', page: cur };

    const otpCells = cur.locator('input[data-testid^="otp-input-index-"]');
    const otpSubmit = cur.locator('#otp-submit, [id*="otp-submit" i], button:has-text("验证")').first();
    if ((await otpCells.first().isVisible().catch(() => false)) || (await otpSubmit.isVisible().catch(() => false))) {
      return { kind: 'verification', page: cur };
    }

    await cur.waitForTimeout(200);
  }
  return { kind: 'unknown', page };
}

test('auth: login, go app, save session', async ({ page, context }) => {
  await page.goto(APP_URL!, { waitUntil: 'domcontentloaded' });

  const avatarQuick = page.getByRole('img', { name: /^Account$/i }).first();
  if (await avatarQuick.isVisible().catch(() => false)) {
    await navigateToApp(page);
    const app = new AppPage(page);
    await app.waitReady();
    await context.storageState({ path: 'e2e/.auth.json' });
    return;
  }

  await page.locator('input[data-testid="username"], input[name="username"], input[type="email"]').first().fill(E2E_USER!);
  await page.locator('#login-submit, [data-testid="login-submit"], button[type="submit"]').first().click();
  await page.locator('input[data-testid="password"], input[name="password"], input[type="password"]').first().fill(E2E_PASS!);
  await page.locator('#login-submit, [data-testid="login-submit"], button[type="submit"]').first().click();

  const outcome = await detectAuthOutcome(page, context, 60000);

  if (outcome.kind === 'verification') {
    let cur = outcome.page;
    await cur.bringToFront();

    const otpCells = cur.locator('input[data-testid^="otp-input-index-"]');
    const otpSubmit = cur.locator('#otp-submit, [id*="otp-submit" i], button:has-text("验证")').first();
    await waitForOneOf(cur, [otpCells.first(), otpSubmit], 60000);

    const code = (await getGmailCode({
      fromContains: 'Confluence',
      subjectContains: "Verifying it's you",
      timeoutMs: 120000,
      pollIntervalMs: 2000,
    }))
      .slice(0, 6)
      .toUpperCase();

    await expect(otpCells).toHaveCount(6, { timeout: 60000 });
    await otpCells.nth(0).click({ force: true });
    await cur.keyboard.type(code, { delay: 50 });

    await Promise.race([
      cur.waitForURL(URL_AFTER_OTP_RE, { timeout: 30000 }).catch(() => null),
      cur.locator('iframe[data-testid="hosted-resources-iframe"]').first().waitFor({ timeout: 30000 }).catch(() => null),
    ]);

    const outcome2 = await detectAuthOutcome(cur, context, 30000);
    let pageAfter: Page;
    if (['wiki', 'logged', 'appframe'].includes(outcome2.kind)) {
      pageAfter = getConfluencePage(context);
      await pageAfter.bringToFront();
    } else {
      throw new Error(`After verification, unexpected outcome: ${outcome2.kind}`);
    }

    await navigateToApp(pageAfter);
    const app = new AppPage(pageAfter);
    await app.waitReady();
    await context.storageState({ path: 'e2e/.auth.json' });
    return;
  }

  if (outcome.kind === 'wiki' || outcome.kind === 'logged' || outcome.kind === 'appframe') {
    const p = getConfluencePage(context);
    await p.bringToFront();
    await navigateToApp(p);
    const app = new AppPage(p);
    await app.waitReady();
    await context.storageState({ path: 'e2e/.auth.json' });
    return;
  }

  await navigateToApp(page).catch(() => {});
  const app2 = new AppPage(page);
  await app2.waitReady();
  await context.storageState({ path: 'e2e/.auth.json' });
});
