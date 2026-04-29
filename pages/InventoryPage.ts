import { Page, Locator, expect } from '@playwright/test';

export interface Product {
    name: string;
    description: string;
    price: number;
}

export class InventoryPage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly pageTitle: Locator;
    readonly productItems: Locator;
    readonly cartLink: Locator;
    readonly cartBadge: Locator;
    readonly menuButton: Locator;
    readonly menuLogoutLink: Locator;
    readonly menuResetLink: Locator;
    readonly errorMessage: Locator;

    constructor(private page: Page) {
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.pageTitle = page.locator('[data-test="title"]');
        this.productItems = page.locator('[data-test="inventory-item"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
        this.menuButton = page.locator('#react-burger-menu-btn');
        this.menuLogoutLink = page.locator('[data-test="logout-sidebar-link"]');
        this.menuResetLink = page.locator('[data-test="reset-sidebar-link"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async gotoLoginPage() {
        await this.page.goto('https://www.saucedemo.com');
    }

    async gotoInventoryPageDirectly(expected: string) {
        await this.page.goto('https://www.saucedemo.com/inventory.html');
        await expect(this.errorMessage).toHaveText(expected);
    }

    async login(username = 'standard_user', password = 'secret_sauce') {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async gotoInventoryLoggedIn(): Promise<void> {
        await this.page.goto('/inventory.html');
    }

    async assertOnInventoryPage(): Promise<void> {
        await expect(this.page).toHaveURL(/inventory.html/);
        await expect(this.pageTitle).toHaveText('Products');
    }

    async getProductNames(): Promise<string[]> {
        return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
    }

    async getProductPrices(): Promise<number[]> {
        const priceTexts = await this.page
            .locator('[data-test="inventory-item-price"]')
            .allTextContents();
        return priceTexts.map((p) => parseFloat(p.replace('$', '')));
    }

    async getProductCount(): Promise<number> {
        return this.productItems.count();
    }

    async addToCart(productName: string): Promise<void> {
        const slug = productName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
    }

    async removeFromCart(productName: string): Promise<void> {
        const slug = productName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        await this.page.locator(`[data-test="remove-${slug}"]`).click();
    }

    async getCartBadgeCount(): Promise<number> {
        const visible = await this.cartBadge.isVisible();
        if (!visible) return 0;
        return parseInt((await this.cartBadge.textContent()) ?? '0', 10);
    }

    async clickProductByName(name: string): Promise<void> {
        await this.page.locator('[data-test="inventory-item-name"]', { hasText: name }).click();
    }

    async openMenu(): Promise<void> {
        await this.menuButton.click();
        await expect(this.menuLogoutLink).toBeVisible();
    }

    async logout(): Promise<void> {
        await this.openMenu();
        await this.menuLogoutLink.click();
        await expect(this.page).toHaveURL('/');
    }

    async resetAppState(): Promise<void> {
        await this.openMenu();
        await this.menuResetLink.click();
    }

    async getAllProducts(): Promise<Product[]> {
        const items = this.productItems;
        const count = await items.count();
        const products: Product[] = [];

        for (let i = 0; i < count; i++) {
            const item = items.nth(i);
            const name = (await item.locator('[data-test="inventory-item-name"]').textContent()) ?? '';
            const description =
                (await item.locator('[data-test="inventory-item-desc"]').textContent()) ?? '';
            const priceText =
                (await item.locator('[data-test="inventory-item-price"]').textContent()) ?? '0';
            const price = parseFloat(priceText.replace('$', ''));
            products.push({ name, description, price });
        }
        return products;
    }
}
