import test, { expect } from '@playwright/test'

const CONTENT = '学编程不如学烧烤'

test('发布帖子流程', async ({ page }) => {
  await page.goto('/publish')

  await page.fill('textarea[name="content"]', CONTENT)

  await page.click('button:has-text("发布")')

  await expect(page.locator('.toast span')).toHaveText('发布成功')
})
