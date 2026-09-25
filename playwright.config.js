import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3101",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: "http://127.0.0.1:3101/api/state",
    reuseExistingServer: false,
  },
  reporter: "list",
});
