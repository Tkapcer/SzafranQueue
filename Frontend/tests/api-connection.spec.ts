import { test, expect } from '@playwright/test';

test('frontend łączy się z API Laravela: logowanie', async ({ page }) => {
    page.on('requestfailed', (req) => {
        console.error('REQUEST FAILED:', req.method(), req.url(), req.failure()?.errorText);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') console.error('BROWSER CONSOLE:', msg.text());
    });

    await page.goto('http://localhost:8081');

    await page.getByPlaceholder('Email').fill('student@example.com');
    await page.getByPlaceholder('Password').fill('Haslo123!');

    const [loginResponse] = await Promise.all([
        page.waitForResponse(
            (res) => res.url().includes('/api/login') && res.request().method() === 'POST'
        ),
        page.getByRole('button', { name: 'Log in' }).click(),
    ]);

    if (loginResponse.status() !== 200) {
        console.error('ODPOWIEDŹ SERWERA:', loginResponse.status(), await loginResponse.text());
    }

    expect(loginResponse.status()).toBe(200);
    const body = await loginResponse.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe('student@example.com');

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('button', { name: 'Log in' })).toBeHidden();
});