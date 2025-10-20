import { Page, FrameLocator, Locator } from '@playwright/test';

export class AppPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get frame(): FrameLocator {
    return this.page.frameLocator('iframe[data-testid="hosted-resources-iframe"]');
  }

  async waitReady() {
    await this.page.locator('iframe[data-testid="hosted-resources-iframe"]').waitFor({ state: 'visible' });
    const root: Locator = this.frame.locator('[data-testid="app-root"], [data-testid="root"], #root').first();
    await root.waitFor({ timeout: 15000 }).catch(() => {});
  }
}
