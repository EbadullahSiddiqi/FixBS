import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Manually point dotenv to your Next.js local env file
config({ path: '.env.local' });

export default defineConfig({
//   out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});