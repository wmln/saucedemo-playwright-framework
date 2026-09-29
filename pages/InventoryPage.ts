import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /**
   * The card for one product, matched on its exact name — not on any text in the
   * card, which would also match a description mentioning another product.
   */
  productCard(name: string): Locator {
    return this.inventoryItems.filter({ has: this.itemNames.getByText(name, { exact: true }) });
  }

  productPrice(name: string): Locator {
    return this.productCard(name).getByTestId('inventory-item-price');
  }

  /** The card's cart button, whichever label it currently shows. */
  productButton(name: string): Locator {
    return this.productCard(name).getByRole('button', { name: /^(Add to cart|Remove)$/ });
  }

  async addToCart(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async openProduct(name: string): Promise<void> {
    await this.productCard(name).getByText(name, { exact: true }).click();
  }
}
