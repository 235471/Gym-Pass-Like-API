import { z } from 'zod'

// Reusable schema for latitude validation
export const latitudeSchema = z.coerce // Use coerce for potential string input from JSON
  .number()
  .refine((value) => Math.abs(value) <= 90, {
    message: 'Latitude must be between -90 and 90.',
  })

// Reusable schema for longitude validation
export const longitudeSchema = z.coerce // Use coerce for potential string input from JSON
  .number()
  .refine((value) => Math.abs(value) <= 180, {
    message: 'Longitude must be between -180 and 180.',
  })

// Reusable schema for UUID validation
export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid ID format (UUID expected).' })
