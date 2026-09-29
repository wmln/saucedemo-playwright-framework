import { test, expect } from '../../fixtures/base.fixture';
import { createCustomer } from '../../factories/customer.factory';
import { parseMoney, sum } from '../../helpers/money';

test.describe('Checkout', () => {
  // cartItems fills the cart before each test; this gets each test to step one.
  test.beforeEach(async ({ cartItems, header, cartPage, checkoutInfoPage }) => {
    await header.openCart();
    await expect(cartPage.itemNames).toHaveCount(cartItems.length);

    await cartPage.checkout();
    await expect(checkoutInfoPage.title).toHaveText('Checkout: Your Information');
  });

  test('CHK-01 completing checkout confirms the order and empties the cart', { tag: '@smoke' }, async ({ checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage, header }) => {
    await checkoutInfoPage.fill(createCustomer());
    await checkoutInfoPage.submit();
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');

    await checkoutOverviewPage.finish();

    await expect(checkoutCompletePage.confirmationHeading).toBeVisible();
    await expect(header.cartBadge).toHaveCount(0);
  });

  test('CHK-02 submitting an empty form asks for the first name', async ({ checkoutInfoPage }) => {
    await checkoutInfoPage.submit();

    await expect(checkoutInfoPage.errorMessage).toHaveText('Error: First Name is required');
  });

  test('CHK-05 overview item total matches the product prices, and total equals item total plus tax', async ({ cartItems, checkoutInfoPage, checkoutOverviewPage }) => {
    await checkoutInfoPage.fill(createCustomer());
    await checkoutInfoPage.submit();
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');

    const expectedSubtotal = sum(cartItems.map((item) => parseMoney(item.price)));
    const subtotal = parseMoney(await checkoutOverviewPage.subtotal.innerText());
    const tax = parseMoney(await checkoutOverviewPage.tax.innerText());
    const total = parseMoney(await checkoutOverviewPage.total.innerText());

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });
});
