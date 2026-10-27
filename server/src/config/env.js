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
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_MODEL: z.string().default('nvidia/nemotron-3-ultra-550b-a55b:free'),
  OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),
});

const rawEnv = {
  ...process.env,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
