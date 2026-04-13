import { chromium, expect } from '@playwright/test'

const EMAIL = 'test@example.com'
const PASSWORD = '123456'

export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // 注册流程
  await page.goto('http://localhost:4173/login')

  await page.click('button:has-text("Sign Up")')

  await expect(page.locator('h1')).toHaveText('Welcome Forum!')

  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASSWORD)
  await page.fill('input[name="confirmPassword"]', PASSWORD)

  await page.click('button:has-text("Sign up")')

  await expect(page.locator('h1')).toHaveText('Welcome back!')

  // 登录流程
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASSWORD)
  await page.click('button:has-text("login")')

  await page.waitForURL('http://localhost:4173')

  await page.context().storageState({ path: 'storageState.json' })

  await browser.close()
}
