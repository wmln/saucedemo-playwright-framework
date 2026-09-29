import { test, expect } from '../../fixtures/base.fixture';

test.describe('Cart', () => {
  test('CART-01 added products appear in the cart with quantity 1 and their inventory price', async ({ cartItems, header, cartPage }) => {
    await header.openCart();

    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText(cartItems.map((item) => item.name));

    for (const item of cartItems) {
      await expect(cartPage.itemQuantity(item.name)).toHaveText('1');
      await expect(cartPage.itemPrice(item.name)).toHaveText(item.price);
    }
  });
});
