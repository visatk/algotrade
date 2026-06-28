import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './src/db/schema.ts', // Adjust this path if your schema is located elsewhere
  dialect: 'sqlite',
});
