import dotenv from 'dotenv'
import { z } from 'zod'

// Load base .env file only
dotenv.config({ path: '.env' })

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url({ message: 'Invalid DATABASE_URL' }),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  COOKIE_SECRET: z.string(), // Add cookie secret
  PORT: z.coerce.number().default(3333),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  throw new Error('Invalid environment variables.')
}

export const env = parsedEnv.data
