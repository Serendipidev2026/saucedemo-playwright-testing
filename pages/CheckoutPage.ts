import { Page, Locator, expect } from '@playwright/test';

export interface CheckoutInfo {
    firstName: string;
    lastName: string;
    postalCode: string;
}

export interface OrderSummary {
    itemTotal: number;
    tax: number;
    total: number;
}

export class CheckoutPage {
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly postalCodeInput: Locator;
    readonly continueButton: Locator;
    readonly cancelButton: Locator;
    readonly errorMessage: Locator;

    // Step Two locators
    readonly finishButton: Locator;
    readonly overviewItems: Locator;
    readonly itemTotalLabel: Locator;
    readonly taxLabel: Locator;
    readonly totalLabel: Locator;

    // Comfirmatino step locators
    readonly confirmationHeader: Locator;
    readonly confirmationText: Locator;
    readonly backHomeButton: Locator;

    constructor(private page: Page) {
        // Step 1 order form
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.errorMessage = page.locator('[data-test="error"]');

        // Step two order review
        this.finishButton = page.locator('[data-test="finish"]');
        this.overviewItems = page.locator('.cart_item');
        this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
        this.taxLabel = page.locator('[data-test="tax-label"]');
        this.totalLabel = page.locator('[data-test="total-label"]');

        // Order confirmation
        this.confirmationHeader = page.locator('[data-test="complete-header"]');
        this.confirmationText = page.locator('[data-test="complete-text"]');
        this.backHomeButton = page.locator('[data-test="back-to-products"]');
    }

    // ─── Step One ────────────────────────────────────────────────────────────────

    async gotoStepOne(): Promise<void> {
        await this.page.goto('/checkout-step-one.html');
    }

    async assertOnStepOne(): Promise<void> {
        await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    }

    async fillInfo(info: CheckoutInfo): Promise<void> {
        await this.firstNameInput.fill(info.firstName);
        await this.lastNameInput.fill(info.lastName);
        await this.postalCodeInput.fill(info.postalCode);
    }

    async clickContinue(): Promise<void> {
        await this.continueButton.click();
    }

    async fillAndContinue(info: CheckoutInfo): Promise<void> {
        await this.fillInfo(info);
        await this.clickContinue();
        await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    }

    async getStepOneError(): Promise<string> {
        await expect(this.errorMessage).toBeVisible();
        return (await this.errorMessage.textContent()) ?? '';
    }

    async cancelCheckout(): Promise<void> {
        await this.cancelButton.click();
    }

    // ─── Step Two ────────────────────────────────────────────────────────────────

    async assertOnStepTwo(): Promise<void> {
        await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    }

    async getOrderSummary(): Promise<OrderSummary> {
        const itemTotalText = (await this.itemTotalLabel.textContent()) ?? '';
        const taxText = (await this.taxLabel.textContent()) ?? '';
        const totalText = (await this.totalLabel.textContent()) ?? '';

        const extract = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ''));

        return {
            itemTotal: extract(itemTotalText),
            tax: extract(taxText),
            total: extract(totalText),
        };
    }

    async getOverviewItemCount(): Promise<number> {
        return this.overviewItems.count();
    }

    async clickFinish(): Promise<void> {
        await this.finishButton.click();
        await expect(this.page).toHaveURL(/checkout-complete\.html/);
    }

    // ─── Confirmation ────────────────────────────────────────────────────────────────

    async assertOnCompletePage(): Promise<void> {
        await expect(this.page).toHaveURL(/checkout-complete\.html/);
        await expect(this.confirmationHeader).toBeVisible();
    }

    async getConfirmationHeader(): Promise<string> {
        return (await this.confirmationHeader.textContent()) ?? '';
    }

    async backToProducts(): Promise<void> {
        await this.backHomeButton.click();
        await expect(this.page).toHaveURL(/inventory\.html/);
    }
}
