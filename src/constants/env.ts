import dotenv from 'dotenv';
import z from 'zod';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}`, override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  IMAGE_KIT_PRIVATE_KEY: z.string(),
  CLOUDFLARE_R2_BASEURL: z.string().optional(),
  JWT_EXPIRES_IN: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379').optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment variables error: ', parsed.error.issues);
  throw new Error(`Environment variable validation failed: ${JSON.stringify(parsed.error.issues)}`);
}

const env = {
  ...parsed.data,
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};

export default env;
