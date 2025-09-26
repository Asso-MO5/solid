import { z } from "zod";

export const serverScheme = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DISCORD_ID: z.string(),
  DISCORD_SECRET: z.string(),
  DISCORD_TOKEN: z.string(),
  DISCORD_GUILD_ID: z.string(),
  AUTH_SECRET: z.string(),
  AUTH_TRUST_HOST: z.string().optional(),
  AUTH_URL: z.string().optional(),
  DATABASE_URL: z.string(),
  ENCRYPTION_KEY: z.string(),
});

export const clientScheme = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  VITE_AUTH_PATH: z.string().optional(),
  VITE_ENTITY_NAME: z.string().optional(),
  VITE_OCELOT_URL: z.string().default('http://localhost:4000'),
  VITE_OCELOT_WS: z.string().default('ws://localhost:4000/ws'),
});
