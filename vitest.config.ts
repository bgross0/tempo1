/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: ['node_modules', '.next', 'cypress'],
    globals: true,
    css: false,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/_app.{ts,tsx}',
        'src/**/document.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/.next/**',
        '**/node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})