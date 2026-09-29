import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { HeaderComponent } from '../pages/HeaderComponent';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

export type CartItem = {
  name: string;
  price: string;
};

/**
 * The single root fixture. Every spec imports { test, expect } from here.
 *
 * Two kinds of fixture live in this file:
 *
 * - Page Object fixtures construct an object and nothing else. They never
 *   navigate, so a Page Object can be used from any starting point.
 * - State fixtures (cartItems) put the app into a known state before the test
 *   starts. Driving the app is their whole job. Setup goes before `use()`;
 *   teardown, when there is anything to undo, goes after it.
 *
 * Fixtures are lazy: Playwright constructs only what a test destructures.
 */
type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  header: HeaderComponent;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;

  /** Products cartItems puts in the cart. Override per file with test.use({ cartProducts: [...] }). */
  cartProducts: string[];
  /** The cart, already filled with cartProducts, as seen on the inventory page. */
  cartItems: CartItem[];
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },

  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  cartProducts: [['Sauce Labs Backpack', 'Sauce Labs Bike Light'], { option: true }],

  cartItems: async ({ inventoryPage, header, cartProducts }, use) => {
    await inventoryPage.navigate();

    const items: CartItem[] = [];
    for (const name of cartProducts) {
      items.push({ name, price: await inventoryPage.productPrice(name).innerText() });
      await inventoryPage.addToCart(name);
    }

    // Fail here, in setup, rather than inside the test if the cart didn't fill.
    await expect(header.cartBadge).toHaveText(String(cartProducts.length));

    await use(items);

    // No teardown needed: saucedemo keeps the cart in browser storage, and
    // Playwright discards this test's browser context when it ends. Against an
    // app with a backend, delete the created records here.
  },
});

export { expect } from '@playwright/test';
