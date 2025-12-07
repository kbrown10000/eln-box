import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/projects');
    
    // Verify redirection to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login page content - use specific heading role to avoid ambiguity with nav links
    await expect(page.getByRole('heading', { name: 'LabNoteX' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Box' })).toBeVisible();
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'LabNoteX' })).toBeVisible();
    await expect(page.getByText('Secure, Cloud-Based Research')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Box' })).toBeVisible();
  });
});
