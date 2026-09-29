import { Page, Locator } from '@playwright/test';

/** Checkout confirmation: "Checkout: Complete!". */
export class CheckoutCompletePage {
  readonly page: Page;
  readonly confirmationHeading: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your order!' });
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
