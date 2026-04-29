import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
    readonly productImage: Locator;
    readonly productName: Locator;
    readonly productDescription: Locator;
    readonly productPrice: Locator;
    readonly addToCartButton: Locator;
    readonly removeFromCartButton: Locator;
    readonly backToProductsButton: Locator;
    readonly cartBadge: Locator;
    readonly cartLink: Locator;

    constructor(private page: Page) {
        this.productImage = page.locator('[data-test="item-sauce-labs-backpack-img"]'); // This might need to be dynamic
        this.productName = page.locator('[data-test="inventory-item-name"]');
        this.productDescription = page.locator('[data-test="inventory-item-desc"]');
        this.productPrice = page.locator('[data-test="inventory-item-price"]');
        this.addToCartButton = page.locator('[data-test="add-to-cart"]');
        this.removeFromCartButton = page.locator('[data-test="remove"]');
        this.backToProductsButton = page.locator('[data-test="back-to-products"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    }

    async goto(productId: string) {
        await this.page.goto(`/inventory-item.html?id=${productId}`);
    }

    async assertOnProductPage() {
        await expect(this.productName).toBeVisible();
        await expect(this.productDescription).toBeVisible();
        await expect(this.productPrice).toBeVisible();
    }

    async getProductName(): Promise<string> {
        return (await this.productName.textContent()) ?? '';
    }

    async getProductDescription(): Promise<string> {
        return (await this.productDescription.textContent()) ?? '';
    }

    async getProductPrice(): Promise<number> {
        const priceText = (await this.productPrice.textContent()) ?? '$0';
        return parseFloat(priceText.replace('$', ''));
    }

    async addToCart() {
        await this.addToCartButton.click();
    }

    async removeFromCart() {
        await this.removeFromCartButton.click();
    }

    async backToProducts() {
        await this.backToProductsButton.click();
    }

    async getCartBadgeCount(): Promise<number> {
        const isVisible = await this.cartBadge.isVisible();
        if (!isVisible) return 0;

        const text = await this.cartBadge.textContent();
        const count = parseInt(text ?? '0', 10);

        if (isNaN(count) || count < 1) {
            throw new Error(`Unexpected cart badge value: "${text}"`);
        }
        return count;
    }

    async goToCart() {
        await this.cartLink.click();
    }

    async isAddToCartButtonVisible(): Promise<boolean> {
        return await this.addToCartButton.isVisible();
    }

    async isRemoveFromCartButtonVisible(): Promise<boolean> {
        return await this.removeFromCartButton.isVisible();
    }
}