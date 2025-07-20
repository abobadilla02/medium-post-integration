import { test, expect } from '@playwright/test';

test.describe('Post List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/posts');
  });

  test('should display post list header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Scheduled Posts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await expect(page.getByText('Loading posts...')).toBeVisible();
  });

  test('should display posts when data is loaded', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('.post-card', { timeout: 10000 });
    
    // Check that posts are displayed
    const postCards = page.locator('.post-card');
    await expect(postCards).toHaveCount(2); // Based on our mock data
    
    await expect(page.getByText('Test Post 1')).toBeVisible();
    await expect(page.getByText('Test Post 2')).toBeVisible();
  });

  test('should show empty state when no posts exist', async ({ page }) => {
    // Mock empty response by intercepting the GraphQL request
    await page.route('**/graphql', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            scheduledPosts: []
          }
        })
      });
    });

    await page.reload();
    
    await expect(page.getByText('No posts scheduled yet')).toBeVisible();
    await expect(page.getByText('Create your first scheduled post to get started!')).toBeVisible();
  });

  test('should display post status correctly', async ({ page }) => {
    await page.waitForSelector('.post-status', { timeout: 10000 });
    
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('Published')).toBeVisible();
  });

  test('should truncate long content', async ({ page }) => {
    await page.waitForSelector('.post-card', { timeout: 10000 });
    
    const truncatedContent = page.getByText(/This is a test post content that should be truncated/);
    await expect(truncatedContent).toBeVisible();
    
    const content = await truncatedContent.textContent();
    expect(content).toContain('...');
  });

  test('should format dates correctly', async ({ page }) => {
    await page.waitForSelector('.post-card', { timeout: 10000 });
    
    // Check that dates are formatted and displayed
    await expect(page.getByText(/January 15, 2024/)).toBeVisible();
    await expect(page.getByText(/January 16, 2024/)).toBeVisible();
  });

  test('should show Medium Post ID when available', async ({ page }) => {
    await page.waitForSelector('.post-card', { timeout: 10000 });
    
    await expect(page.getByText('Medium Post ID:')).toBeVisible();
    await expect(page.getByText('medium-123')).toBeVisible();
  });

  test('should handle refresh button click', async ({ page }) => {
    await page.waitForSelector('button:has-text("Refresh")', { timeout: 10000 });
    
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    await refreshButton.click();
    
    // Button should show loading state briefly
    await expect(page.getByText('Refreshing...')).toBeVisible();
  });

  test('should apply correct CSS classes for status', async ({ page }) => {
    await page.waitForSelector('.post-status', { timeout: 10000 });
    
    const pendingStatus = page.locator('.post-status.status-pending');
    const publishedStatus = page.locator('.post-status.status-published');
    
    await expect(pendingStatus).toBeVisible();
    await expect(publishedStatus).toBeVisible();
  });

  test('should display post metadata correctly', async ({ page }) => {
    await page.waitForSelector('.post-meta', { timeout: 10000 });
    
    await expect(page.getByText(/Scheduled for:/)).toBeVisible();
    await expect(page.getByText(/Published at:/)).toBeVisible();
    await expect(page.getByText(/Created:/)).toBeVisible();
  });

  test('should handle posts without titles', async ({ page }) => {
    // Mock a post without title
    await page.route('**/graphql', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            scheduledPosts: [
              {
                id: '4',
                title: '',
                content: 'Content without title',
                scheduledFor: '2024-01-17T10:00:00.000Z',
                publishedAt: null,
                status: 'pending',
                mediumPostId: null,
                createdAt: '2024-01-17T09:00:00.000Z',
              },
            ],
          }
        })
      });
    });

    await page.reload();
    
    await expect(page.getByText('Untitled Post')).toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    // Mock error response
    await page.route('**/graphql', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [
            {
              message: 'Failed to fetch posts'
            }
          ]
        })
      });
    });

    await page.reload();
    
    await expect(page.getByText(/Error loading posts/)).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.waitForSelector('button:has-text("Refresh")', { timeout: 10000 });
    
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshButton).toBeVisible();
    
    // Check that posts are in a grid layout
    const postsGrid = page.locator('.posts-grid');
    await expect(postsGrid).toBeVisible();
  });

  test('should navigate back to create post page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Post' }).click();
    await expect(page).toHaveURL('/');
  });
}); 