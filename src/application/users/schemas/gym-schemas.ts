import { z } from 'zod'

// Register gym Schema
export const gymUpsertSchema = z.object({
  title: z.string().nonempty('Title is required.'),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

// Types
export type RegisterUserSchemaInput = z.infer<typeof gymUpsertSchema>
