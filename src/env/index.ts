import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().default(3333),
})

const envData = envSchema.safeParse(process.env)

if (!envData.success) {
  console.error('Invalid environment variables', envData.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = envData.data
