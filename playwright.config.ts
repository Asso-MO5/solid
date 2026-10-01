import { defineConfig } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? "4173");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command: "bun run build && bun .output/server/index.mjs",
    port,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: String(port),
      NITRO_PORT: String(port),
      OCLOT_API_URL: "http://127.0.0.1:5999",
      LOG_LEVEL: "error",
    },
  },
});
