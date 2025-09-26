import { defineConfig } from "@solidjs/start/config";
import tailwindcss from '@tailwindcss/vite'
import path from "node:path";

export default defineConfig({
  ssr: true,
  vite: {
    // @ts-expect-error - Tailwind CSS Vite plugin is not typed
    plugins: [tailwindcss()],
  },
  alias: {
    '~': path.resolve(process.cwd(), 'src'),
  },
});
