import { test, expect } from '@playwright/test';

test.describe('Synapse Branding', () => {
  test('Homepage should display new branding', async ({ page }) => {
    await page.goto('/');
    
    // Check Title
    await expect(page).toHaveTitle(/Synapse/);
    
    // Check Hero Text
    await expect(page.getByText('The Intelligent Lab OS')).toBeVisible();
    await expect(page.getByText('Built on Box')).toBeVisible();
    await expect(page.getByText('POWERED BY USDM LIFE SCIENCES')).toBeVisible();
    
    // Check Vision Video Placeholder
    await expect(page.getByText('VISION 2030')).toBeVisible();
  });

  test('About page should display architecture diagram', async ({ page }) => {
    await page.goto('/about');
    
    await expect(page.getByRole('heading', { name: 'The Architecture of Innovation' })).toBeVisible();
    
    // Check for the image
    const img = page.locator('img[alt="Synapse Platform Architecture"]');
    await expect(img).toBeVisible();
  });
});
