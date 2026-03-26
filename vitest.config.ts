import { defineVitestConfig } from '@nuxt/test-utils/config'
import { configDefaults } from 'vitest/config'

// Silence @nuxtjs/supabase "missing url/key" warnings in the test environment.
// The Supabase client is always mocked in tests so these values are never used.
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://placeholder.supabase.co'
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY ?? 'placeholder-anon-key'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    exclude: [...configDefaults.exclude, '**/tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/composables/**/*.ts',
        'app/stores/**/*.ts',
        'app/utils/**/*.ts'
      ],
      exclude: [
        'app/types/**',
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
