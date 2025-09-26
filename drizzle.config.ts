import { defineConfig } from 'drizzle-kit';
import { serverEnv } from './src/env/server';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
