import { Page, Locator } from '@playwright/test';

/** Checkout step two: "Checkout: Overview". */
export class CheckoutOverviewPage {
  readonly page: Page;
  readonly title: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  // The price summary is plain text with no accessible roles, so test-ids it is.
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    // inventory-item-name/-price are reused by the inventory, detail, cart and
    // overview pages. Assert something unique to this page (its title or back
    // button) before these, or they can match the page you just left.
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
