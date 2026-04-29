import { test, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const CHECKOUT_INFO = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345',
};

test.describe('Checkout Flow', () => {
    let inventoryPage: InventoryPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;
    let testPage: any;

    test.beforeEach(async ({ page }) => {
        testPage = page;
        inventoryPage = new InventoryPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        await inventoryPage.gotoLoginPage();
        await inventoryPage.login();
    });

    async function setupCheckout(): Promise<void> {
        await inventoryPage.addToCart('Sauce Labs Backpack');
        await cartPage.goto();
        await cartPage.proceedToCheckout();
    }

    test.describe('Step One — Customer Info', () => {
        test('shows checkout step one page', async () => {
            await setupCheckout();
            await checkoutPage.assertOnStepOne();
        });

        test('can fill and submit customer info', async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
            await checkoutPage.assertOnStepTwo();
        });

        test('shows error when first name is missing', async () => {
            await setupCheckout();
            await checkoutPage.fillInfo({ firstName: '', lastName: 'Doe', postalCode: '75001' });
            await checkoutPage.clickContinue();
            const error = await checkoutPage.getStepOneError();
            expect(error).toContain('First Name is required');
        });

        test('shows error when last name is missing', async () => {
            await setupCheckout();
            await checkoutPage.fillInfo({ firstName: 'Jane', lastName: '', postalCode: '75001' });
            await checkoutPage.clickContinue();
            const error = await checkoutPage.getStepOneError();
            expect(error).toContain('Last Name is required');
        });

        test('shows error when postal code is missing', async () => {
            await setupCheckout();
            await checkoutPage.fillInfo({ firstName: 'Jane', lastName: 'Doe', postalCode: '' });
            await checkoutPage.clickContinue();
            const error = await checkoutPage.getStepOneError();
            expect(error).toContain('Postal Code is required');
        });

        test('cancel returns to cart', async () => {
            await setupCheckout();
            await checkoutPage.cancelCheckout();
            await expect(testPage).toHaveURL(/cart\.html/);
        });
    });

    test.describe('Step Two — Order Overview', () => {
        test.beforeEach(async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
        });

        test('shows the ordered item in the summary', async () => {
            const count = await checkoutPage.getOverviewItemCount();
            expect(count).toBe(1);
        });

        test('displays item total, tax, and total', async () => {
            const summary = await checkoutPage.getOrderSummary();
            expect(summary.itemTotal).toBeGreaterThan(0);
            expect(summary.tax).toBeGreaterThan(0);
            expect(summary.total).toBeCloseTo(summary.itemTotal + summary.tax, 2);
        });

        test('total equals item subtotal plus tax', async () => {
            const { itemTotal, tax, total } = await checkoutPage.getOrderSummary();
            expect(total).toBeCloseTo(itemTotal + tax, 2);
        });

        test('cancel on step two returns to inventory', async () => {
            await checkoutPage.cancelCheckout();
            await expect(testPage).toHaveURL(/inventory\.html/);
        });
    });

    test.describe('Step Three — Order Complete', () => {
        test('order completes successfully', async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
            await checkoutPage.clickFinish();
            await checkoutPage.assertOnCompletePage();
        });

        test('confirmation header says "Thank you for your order!"', async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
            await checkoutPage.clickFinish();
            const header = await checkoutPage.getConfirmationHeader();
            expect(header).toContain('Thank you for your order!');
        });

        test('cart is empty after order completion', async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
            await checkoutPage.clickFinish();
            const badge = testPage.locator('[data-test="shopping-cart-badge"]');
            await expect(badge).not.toBeVisible();
        });

        test('Back Home button returns to inventory', async () => {
            await setupCheckout();
            await checkoutPage.fillAndContinue(CHECKOUT_INFO);
            await checkoutPage.clickFinish();
            await checkoutPage.backToProducts();
        });
    });
});
