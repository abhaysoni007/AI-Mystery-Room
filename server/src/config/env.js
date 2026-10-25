import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: ['.env', '../.env'] });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/ai-mystery-room'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('super_secret_jwt_key_change_in_production'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
