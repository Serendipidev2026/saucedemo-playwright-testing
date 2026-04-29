import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage'; // Adjust path if necessary

test.describe('Inventory Page Tests', () => {

    let inventoryPage: InventoryPage;

    test.beforeEach(async ({ page }) => {
        inventoryPage = new InventoryPage(page);
        await inventoryPage.gotoLoginPage();
        await inventoryPage.login();
    });

    test('should require login before accessing inventory page', async ({ page }) => {
        await inventoryPage.logout();
        await inventoryPage.gotoInventoryPageDirectly("Epic sadface: You can only access '/inventory.html' when you are logged in.");

    });

    test('should allow inventory access only after login, redirect to the login page and show an error message', async ({ page }) => {
        await inventoryPage.gotoInventoryLoggedIn();
    });

    test('Should be able to get product names and prices', async () => {
        const productNames = await inventoryPage.getProductNames();
        const productPrices = await inventoryPage.getProductPrices();

        expect(productNames.length).toBeGreaterThan(0);
        expect(productPrices.length).toBeGreaterThan(0);

        expect(productNames.length).toBe(productPrices.length);
    });

    test('Should be able to add multiple products to the cart and update cart badge', async () => {
        const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

        for (let i = 0; i < productNames.length; i++) {
            await inventoryPage.addToCart(productNames[i]);

            const cartBadgeCount = await inventoryPage.getCartBadgeCount();
            expect(cartBadgeCount).toBe(i + 1);

            await expect(inventoryPage.cartBadge).toBeVisible();
        }
    });

    test('Should be able to remove product from the cart', async () => {
        const productName = 'Sauce Labs Backpack';

        await inventoryPage.addToCart(productName);

        await inventoryPage.removeFromCart(productName);

        const cartBadgeCount = await inventoryPage.getCartBadgeCount();
        expect(cartBadgeCount).toBe(0);
    });

    test('Cart badge counter increments on each add', async () => {
        const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
        let expectedCount = 0;
        let cartBadgeCount = await inventoryPage.getCartBadgeCount();
        expect(cartBadgeCount).toBe(expectedCount);

        for (const productName of productNames) {
            await inventoryPage.addToCart(productName);
            expectedCount++;
            cartBadgeCount = await inventoryPage.getCartBadgeCount();
            expect(cartBadgeCount).toBe(expectedCount);
        }
    });

    test('Cart badge decrements when "Remove" is clicked', async () => {
        const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

        for (const productName of productNames) {
            await inventoryPage.addToCart(productName);
        }

        let expectedCount = productNames.length;
        let cartBadgeCount = await inventoryPage.getCartBadgeCount();
        expect(cartBadgeCount).toBe(expectedCount);

        for (const productName of productNames) {
            await inventoryPage.removeFromCart(productName);
            expectedCount--;
            cartBadgeCount = await inventoryPage.getCartBadgeCount();
            expect(cartBadgeCount).toBe(expectedCount);
        }
    });

    test('Should be able to log out from the inventory page', async ({ page }) => {
        await inventoryPage.logout();

        await expect(page).toHaveURL('/');
    });

    test('Should be able to reset app state', async () => {
        await inventoryPage.resetAppState();

        const cartBadgeCount = await inventoryPage.getCartBadgeCount();
        expect(cartBadgeCount).toBe(0);
    });

    test('Should navigate to a product details page when clicking a product', async ({ page }) => {
        const productName = 'Sauce Labs Backpack';

        await inventoryPage.clickProductByName(productName);

        await expect(page).toHaveURL(/inventory-item/);
    });
});