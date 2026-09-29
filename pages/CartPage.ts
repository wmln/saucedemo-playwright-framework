import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    // inventory-item-name/-price are reused by the inventory, detail, cart and
    // overview pages. Assert something unique to this page (its title or back
    // button) before these, or they can match the page you just left.
    this.cartItems = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /** One cart line, matched on its exact product name. */
  cartItem(name: string): Locator {
    return this.cartItems.filter({ has: this.itemNames.getByText(name, { exact: true }) });
  }

  itemQuantity(name: string): Locator {
    return this.cartItem(name).getByTestId('item-quantity');
  }

  itemPrice(name: string): Locator {
    return this.cartItem(name).getByTestId('inventory-item-price');
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
