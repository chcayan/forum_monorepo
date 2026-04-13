import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  globalSetup: './e2e/login.setup.ts',
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    storageState: './storageState.json',
  },
  webServer: {
    command: 'pnpm preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
})
