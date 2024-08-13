import dotenv from 'dotenv'
// eslint-disable-next-line import-x/no-internal-modules
import { defineConfig } from 'vitest/config'

dotenv.config()

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.startup.ts'],
  },
})
