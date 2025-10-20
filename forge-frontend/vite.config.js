// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
      '@components': path.resolve(__dirname, './src/components'),
      '@common': path.resolve(__dirname, './src/components/common'),
      '@main': path.resolve(__dirname, './src/components/main'),
      '@setting': path.resolve(__dirname, './src/components/setting'),
      '@toolbar': path.resolve(__dirname, './src/components/toolbar'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@services': path.resolve(__dirname, './src/services'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    include: ['test/unit/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist','**/coverage/**','coverage/**','e2e/**','.git/**','playwright-report/**','test-results/**'],
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'node_modules',
        'dist',
        'e2e',
        'test',
        'coverage',
        'playwright-report',
        'test-results',
        '**/*.config.{js,ts}',
        '**/*.setup.{js,ts}',
        'src/theme/themes',
        'src/i18n/languages'
      ]
    }
  },
});
