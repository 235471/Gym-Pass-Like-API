import { z } from 'zod'

// Register gym Schema
export const gymUpsertSchema = z.object({
  title: z.string().nonempty('Title is required.'),
  description: z.string().nullish(), // Use nullish() for optional + nullable
  phone: z.string().nullish(),     // Use nullish() for optional + nullable
  latitude: z.number()
    .min(-90, { message: 'Latitude must be greater than or equal to -90' })
    .max(90, { message: 'Latitude must be less than or equal to 90' }),
  longitude: z.number()
    .min(-180, { message: 'Longitude must be greater than or equal to -180' })
    .max(180, { message: 'Longitude must be less than or equal to 180' }),
})

// Types
export type RegisterUserSchemaInput = z.infer<typeof gymUpsertSchema>
