import { Page, Locator } from '@playwright/test';

/** The header shown on every logged-in page: menu, cart button and cart badge. */
export class HeaderComponent {
  readonly page: Page;
  readonly menuButton: Locator;
  readonly cartButton: Locator;
  readonly cartBadge: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    // Accessible name tracks the contents ("Cart, empty", "Cart, 2 items").
    this.cartButton = page.getByRole('button', { name: /^Cart,/ });
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // The open menu keeps aria-hidden="true", which hides its items from
    // getByRole. Test-id until saucedemo fixes the menu's accessibility.
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
