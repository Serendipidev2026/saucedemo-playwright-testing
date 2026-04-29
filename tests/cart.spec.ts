import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('Cart Page', () => {
    let inventoryPage: InventoryPage;
    let cartPage: CartPage;

    test.beforeEach(async ({ page }) => {
        inventoryPage = new InventoryPage(page);
        cartPage = new CartPage(page);
        await inventoryPage.gotoLoginPage();
        await inventoryPage.login();
    });

    test.describe('Empty cart', () => {
        test('cart is empty on fresh login', async () => {
            await cartPage.goto();
            await cartPage.assertOnCartPage();
            const count = await cartPage.getCartItemCount();
            expect(count).toBe(0);
        });
    });

    test.describe('Items in cart', () => {
        test('item added from inventory appears in cart', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await cartPage.goto();
            await cartPage.assertItemInCart('Sauce Labs Backpack');
        });

        test('multiple items appear in cart', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.addToCart('Sauce Labs Bike Light');
            await cartPage.goto();
            const count = await cartPage.getCartItemCount();
            expect(count).toBe(2);
        });

        test('cart items display correct price', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await cartPage.goto();
            const items = await cartPage.getCartItems();
            expect(items[0].price).toBeGreaterThan(0);
        });

        test('cart items show quantity of 1', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await cartPage.goto();
            const items = await cartPage.getCartItems();
            expect(items[0].quantity).toBe(1);
        });

        test('cart items match inventory items details', async () => {
            const productsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

            for (const product of productsToAdd) {
                await inventoryPage.addToCart(product);
            }

            // Check badge count
            const badgeCount = await inventoryPage.getCartBadgeCount();
            expect(badgeCount).toBe(productsToAdd.length);

            // Get all products from inventory to compare details
            const allInventoryProducts = await inventoryPage.getAllProducts();
            const addedInventoryProducts = allInventoryProducts.filter(product =>
                productsToAdd.includes(product.name)
            );

            // Go to cart and get cart items
            await cartPage.goto();
            const cartItems = await cartPage.getCartItems();

            // Verify count matches
            expect(cartItems.length).toBe(productsToAdd.length);

            // Verify each cart item matches the inventory item
            for (const cartItem of cartItems) {
                const matchingInventoryItem = addedInventoryProducts.find(inventoryItem =>
                    inventoryItem.name === cartItem.name
                );
                expect(matchingInventoryItem).toBeDefined();
                expect(cartItem.description).toBe(matchingInventoryItem!.description);
                expect(cartItem.price).toBe(matchingInventoryItem!.price);
                expect(cartItem.quantity).toBe(1);
            }
        });
    });

    test.describe('Remove items', () => {
        test('removing an item from cart updates the list', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await cartPage.goto();
            await cartPage.removeItem('Sauce Labs Backpack');
            await cartPage.assertItemNotInCart('Sauce Labs Backpack');
        });

        test('removing all items leaves cart empty', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await inventoryPage.addToCart('Sauce Labs Bike Light');
            await cartPage.goto();
            await cartPage.removeItem('Sauce Labs Backpack');
            await cartPage.removeItem('Sauce Labs Bike Light');
            const count = await cartPage.getCartItemCount();
            expect(count).toBe(0);
        });
    });

    test.describe('Navigation', () => {
        test('Continue Shopping returns to inventory', async () => {
            await cartPage.goto();
            await cartPage.continueShopping();
        });

        test('Checkout button navigates to checkout step one', async () => {
            await inventoryPage.addToCart('Sauce Labs Backpack');
            await cartPage.goto();
            await cartPage.proceedToCheckout();
        });
    });
});
