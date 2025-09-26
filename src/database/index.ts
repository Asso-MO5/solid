import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import { serverEnv } from '~/env/server';
import * as schema from './schema';


export const db = drizzle(serverEnv.DATABASE_URL, { schema, mode: 'default' });