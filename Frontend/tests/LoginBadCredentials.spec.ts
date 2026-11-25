import { test, expect } from '@playwright/test';

test('logowanie z błędnymi danymi zwraca 401 i wyświetla komunikat błędu', async ({ page }) => {
    page.on('requestfailed', (req) => {
        console.error('REQUEST FAILED:', req.method(), req.url(), req.failure()?.errorText);
    });

    await page.goto('/');

    await page.getByPlaceholder('Email').fill('student@example.com');
    await page.getByPlaceholder('Password').fill('ZleHaslo123!');

    const [loginResponse] = await Promise.all([
        page.waitForResponse(
            (res) => res.url().includes('/api/login') && res.request().method() === 'POST'
        ),
        page.getByRole('button', { name: 'Log in' }).click(),
    ]);

    if (loginResponse.status() !== 401) {
        console.error('NIEOCZEKIWANA ODPOWIEDŹ:', loginResponse.status(), await loginResponse.text());
    }

    // Weryfikacja odpowiedzi z Laravela
    expect(loginResponse.status()).toBe(401);
    const body = await loginResponse.json();
    expect(body.message).toBe('Invalid credentials.');
    expect(body.token).toBeUndefined();

    // Weryfikacja stanu UI i braku zapisanej sesji
    await expect(page.getByText('Invalid credentials.')).toBeVisible();
    await expect(page).not.toHaveURL(/\/home/);
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('userToken'));
    expect(token).toBeNull();
});