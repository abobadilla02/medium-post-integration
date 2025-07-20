import { test, expect } from '@playwright/test';

test.describe('Create Post Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display create post form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create a New Post' })).toBeVisible();
    await expect(page.getByLabel('Post Title')).toBeVisible();
    await expect(page.getByLabel('Post Content')).toBeVisible();
    await expect(page.getByLabel('Schedule For')).toBeVisible();
    await expect(page.getByLabel('RapidAPI Key')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Post' })).toBeVisible();
  });

  test('should show schedule mode by default', async ({ page }) => {
    await expect(page.getByLabel('Schedule for Later')).toBeChecked();
    await expect(page.getByLabel('Publish Now')).not.toBeChecked();
    await expect(page.getByLabel('Schedule For')).toBeVisible();
  });

  test('should switch to publish now mode', async ({ page }) => {
    await page.getByLabel('Publish Now').check();
    
    await expect(page.getByLabel('Publish Now')).toBeChecked();
    await expect(page.getByLabel('Schedule for Later')).not.toBeChecked();
    await expect(page.getByLabel('Schedule For')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Create Post' });
    await submitButton.click();

    // Check that form validation prevents submission
    await expect(page.getByLabel('Post Title')).toHaveAttribute('required');
    await expect(page.getByLabel('Post Content')).toHaveAttribute('required');
    await expect(page.getByLabel('Schedule For')).toHaveAttribute('required');
  });

  test('should fill and submit form successfully', async ({ page }) => {
    // Fill out the form
    await page.getByLabel('Post Title').fill('Test E2E Post');
    await page.getByLabel('Post Content').fill('This is a test post created during E2E testing');
    await page.getByLabel('Schedule For').fill('2024-12-25T10:00');
    await page.getByLabel('RapidAPI Key').fill('test-api-key');

    // Submit the form
    await page.getByRole('button', { name: 'Create Post' }).click();

    // Should navigate to posts page after successful submission
    await expect(page).toHaveURL('/posts');
  });

  test('should handle publish now mode', async ({ page }) => {
    // Switch to publish now mode
    await page.getByLabel('Publish Now').check();
    
    // Fill out the form
    await page.getByLabel('Post Title').fill('Immediate Publish Post');
    await page.getByLabel('Post Content').fill('This post should be published immediately');
    await page.getByLabel('RapidAPI Key').fill('test-api-key');

    // Submit the form
    await page.getByRole('button', { name: 'Create Post' }).click();

    // Should navigate to posts page
    await expect(page).toHaveURL('/posts');
  });

  test('should show appropriate help text for each mode', async ({ page }) => {
    // Schedule mode help text
    await expect(page.getByText(/The post will be scheduled and published at the specified time/)).toBeVisible();

    // Switch to publish mode
    await page.getByLabel('Publish Now').check();
    
    // Publish mode help text
    await expect(page.getByText(/The post will be published immediately to Medium/)).toBeVisible();
  });

  test('should display markdown help text', async ({ page }) => {
    await expect(page.getByText(/You can use Markdown formatting/)).toBeVisible();
  });

  test('should show RapidAPI information', async ({ page }) => {
    await expect(page.getByText(/We're using the Unofficial Medium API via RapidAPI/)).toBeVisible();
    await expect(page.getByText(/For now, posts are simulated/)).toBeVisible();
  });

  test('should set minimum datetime for scheduling', async ({ page }) => {
    const scheduleInput = page.getByLabel('Schedule For');
    const minValue = await scheduleInput.getAttribute('min');
    
    expect(minValue).toBeTruthy();
    expect(new Date(minValue!)).toBeInstanceOf(Date);
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check that labels are properly associated with inputs
    await expect(page.getByLabel('Post Title')).toHaveAttribute('id', 'title');
    await expect(page.getByLabel('Post Content')).toHaveAttribute('id', 'content');
    await expect(page.getByLabel('Schedule For')).toHaveAttribute('id', 'scheduledFor');
    await expect(page.getByLabel('RapidAPI Key')).toHaveAttribute('id', 'mediumApiToken');
  });
}); 