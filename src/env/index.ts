import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
})

const envData = envSchema.safeParse(process.env)

if (!envData.success) {
  console.error('Invalid environment variables', envData.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = envData.data
