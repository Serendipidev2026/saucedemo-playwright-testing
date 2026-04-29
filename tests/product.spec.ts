import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductPage } from '../pages/ProductPage';

test.describe('Product Page', () => {
    let inventoryPage: InventoryPage;
    let productPage: ProductPage;

    test.beforeEach(async ({ page }) => {
        inventoryPage = new InventoryPage(page);
        productPage = new ProductPage(page);
        await inventoryPage.gotoLoginPage();
        await inventoryPage.login();
    });

    test.describe('Product Details Display', () => {
        test('displays product name, description, and price', async () => {

            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.assertOnProductPage();

            const name = await productPage.getProductName();
            const description = await productPage.getProductDescription();
            const price = await productPage.getProductPrice();

            expect(name).toBe('Sauce Labs Backpack');
            expect(description).toBeTruthy();
            expect(price).toBeGreaterThan(0);
        });

        test('product information matches inventory data', async () => {

            const inventoryProducts = await inventoryPage.getAllProducts();
            const backpackProduct = inventoryProducts.find(p => p.name === 'Sauce Labs Backpack');

            await inventoryPage.clickProductByName('Sauce Labs Backpack');

            const productName = await productPage.getProductName();
            const productDescription = await productPage.getProductDescription();
            const productPrice = await productPage.getProductPrice();

            expect(productName).toBe(backpackProduct?.name);
            expect(productDescription).toBe(backpackProduct?.description);
            expect(productPrice).toBe(backpackProduct?.price);
        });
    });

    test.describe('Add to Cart', () => {
        test('add to cart button is visible for products not in cart', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            const isVisible = await productPage.isAddToCartButtonVisible();
            expect(isVisible).toBe(true);
        });

        test('clicking add to cart updates cart badge', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');

            const initialBadgeCount = await productPage.getCartBadgeCount();
            await productPage.addToCart();

            const updatedBadgeCount = await productPage.getCartBadgeCount();
            expect(updatedBadgeCount).toBe(initialBadgeCount + 1);
        });

        test('add to cart button changes to remove after adding', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');

            await productPage.addToCart();

            const addButtonVisible = await productPage.isAddToCartButtonVisible();
            const removeButtonVisible = await productPage.isRemoveFromCartButtonVisible();

            expect(addButtonVisible).toBe(false);
            expect(removeButtonVisible).toBe(true);
        });
    });

    test.describe('Remove from Cart', () => {
        test('remove button is visible for products in cart', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.addToCart();

            const isVisible = await productPage.isRemoveFromCartButtonVisible();
            expect(isVisible).toBe(true);
        });

        test('clicking remove from cart updates cart badge', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.addToCart();

            const initialBadgeCount = await productPage.getCartBadgeCount();
            await productPage.removeFromCart();

            const updatedBadgeCount = await productPage.getCartBadgeCount();
            expect(updatedBadgeCount).toBe(initialBadgeCount - 1);
        });

        test('remove button changes to add to cart after removing', async () => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.addToCart();
            await productPage.removeFromCart();

            const addButtonVisible = await productPage.isAddToCartButtonVisible();
            const removeButtonVisible = await productPage.isRemoveFromCartButtonVisible();

            expect(addButtonVisible).toBe(true);
            expect(removeButtonVisible).toBe(false);
        });
    });

    test.describe('Navigation', () => {
        test('back to products button returns to inventory', async ({ page }) => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.backToProducts();

            await expect(page).toHaveURL(/inventory\.html/);
        });

        test('cart link navigates to cart page', async ({ page }) => {
            await inventoryPage.clickProductByName('Sauce Labs Backpack');
            await productPage.addToCart();
            await productPage.goToCart();

            await expect(page).toHaveURL(/cart\.html/);
        });
    });
});