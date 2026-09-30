const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  workers: 1,
  timeout: 30000,
  expect: { timeout: 10000 },
  reporter: 'list',
});
