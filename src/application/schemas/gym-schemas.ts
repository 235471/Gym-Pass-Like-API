import { z } from 'zod'
import { latitudeSchema, longitudeSchema } from './common-schemas'

// Regex for Brazilian phone numbers (optional DDD, optional 9th digit for mobile, landlines starting 1-8)
const phoneRegex = /^(\(?\d{2}\)?\s?)?(?:(9\d{4})|([1-8]\d{3}))[-\s]?(\d{4})$/

// Schema for creating/updating a gym
export const registerGymSchema = z.object({
  title: z.string().nonempty({ message: 'Title is required.' }),
  description: z.string().nullable(),
  phone: z
    .string()
    .nullable()
    .refine((val) => val === null || phoneRegex.test(val), {
      message: 'Invalid phone number format.',
    }),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
})

// Schema for searching gyms by query
export const searchGymsQuerySchema = z.object({
  query: z.string(),
  page: z.coerce.number().min(1).default(1),
})

// Schema for searching nearby gyms
export const fetchNearbyGymsQuerySchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
})

// Types
export type RegisterGymSchemaInput = z.infer<typeof registerGymSchema>
export type SearchGymsQuerySchemaInput = z.infer<typeof searchGymsQuerySchema>
export type FetchNearbyGymsQuerySchemaInput = z.infer<
  typeof fetchNearbyGymsQuerySchema
>
