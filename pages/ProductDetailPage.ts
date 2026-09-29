import { Page, Locator } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: 'Back to products' });
    // inventory-item-name/-price are reused by the inventory, detail, cart and
    // overview pages. Assert something unique to this page (its title or back
    // button) before these, or they can match the page you just left.
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }
}
