// cypress.config.ts

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://dev.unich.com/en/otc', // Thay đổi theo URL của ứng dụng của bạn
    specPattern: 'e2e/**/*.cy.ts', // Chỉ định pattern cho file test
    supportFile: 'e2e/support/e2e.ts', // Nơi chỉ định file support chính
    setupNodeEvents(on, config) {
      // Có thể thêm các sự kiện tùy chỉnh nếu cần
      return config;
    },
  },
});
