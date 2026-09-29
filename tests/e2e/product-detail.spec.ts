import { test, expect } from '../../fixtures/base.fixture';

const PRODUCT = 'Sauce Labs Fleece Jacket';

test.describe('Product detail', () => {
  test('PDP-01 product detail shows the same name and price as its inventory card', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.navigate();
    const inventoryPrice = await inventoryPage.productPrice(PRODUCT).innerText();

    await inventoryPage.openProduct(PRODUCT);

    await expect(productDetailPage.backButton).toBeVisible();
    await expect(productDetailPage.name).toHaveText(PRODUCT);
    await expect(productDetailPage.price).toHaveText(inventoryPrice);
  });
});
