import { Page, Locator, expect } from '@playwright/test';

export interface CartItem {
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export class CartPage {
    readonly pageTitle: Locator;
    readonly cartItems: Locator;
    readonly continueShoppingButton: Locator;
    readonly checkoutButton: Locator;

    constructor(private page: Page) {
        this.pageTitle = page.locator('[data-test="title"]');
        this.cartItems = page.locator('.cart_item');
        this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
    }

    async goto(): Promise<void> {
        await this.page.goto('/cart.html');
    }

    async assertOnCartPage(): Promise<void> {
        await expect(this.page).toHaveURL(/cart\.html/);
        await expect(this.pageTitle).toHaveText('Your Cart');
    }

    async getCartItemCount(): Promise<number> {
        return this.cartItems.count();
    }

    async getCartItems(): Promise<CartItem[]> {
        const count = await this.cartItems.count();
        const items: CartItem[] = [];

        for (let i = 0; i < count; i++) {
            const item = this.cartItems.nth(i);
            const name = (await item.locator('[data-test="inventory-item-name"]').textContent()) ?? '';
            const description =
                (await item.locator('[data-test="inventory-item-desc"]').textContent()) ?? '';
            const priceText =
                (await item.locator('[data-test="inventory-item-price"]').textContent()) ?? '0';
            const price = parseFloat(priceText.replace('$', ''));
            const qtyText = (await item.locator('[data-test="item-quantity"]').textContent()) ?? '1';
            const quantity = parseInt(qtyText, 10);
            items.push({ name, description, price, quantity });
        }

        return items;
    }

    async removeItem(productName: string): Promise<void> {
        const slug = productName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        await this.page.locator(`[data-test="remove-${slug}"]`).click();
    }

    async assertItemInCart(productName: string): Promise<void> {
        await expect(
            this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        ).toBeVisible();
    }

    async assertItemNotInCart(productName: string): Promise<void> {
        await expect(
            this.page.locator('[data-test="inventory-item-name"]', { hasText: productName })
        ).not.toBeVisible();
    }

    async continueShopping(): Promise<void> {
        await this.continueShoppingButton.click();
        await expect(this.page).toHaveURL(/inventory\.html/);
    }

    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.click();
        await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    }
}
