import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';


test.describe('Login Page Tests', () => {

    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);

        await loginPage.goto();
    });
    test('Test login with valid credentials', async ({ page }) => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);
    });

    test('Invalid login shows correct error message', async ({ page }) => {
        await loginPage.login('invalid_user', 'secret_sauce');
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.errorMessage.textContent();
        expect(errorText).toContain('Epic sadface: Username and password do not match any user in this service');
    });

    test('Login with wrong password shows correct error message', async ({ page }) => {
        await loginPage.login('standard_user', 'wrong_password');
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.errorMessage.textContent();
        expect(errorText).toContain('Epic sadface: Username and password do not match any user in this service');
    });

    test('Login with empty username/password shows field errors', async ({ page }) => {
        await loginPage.login('', 'secret_sauce');
        await expect(loginPage.errorMessage).toBeVisible();
        let errorText = await loginPage.errorMessage.textContent();
        expect(errorText).toContain('Epic sadface: Username is required');

        await loginPage.errorCloseButton.click();
        await loginPage.login('standard_user', '');
        await expect(loginPage.errorMessage).toBeVisible();
        errorText = await loginPage.errorMessage.textContent();
        expect(errorText).toContain('Epic sadface: Password is required');
    });
});




