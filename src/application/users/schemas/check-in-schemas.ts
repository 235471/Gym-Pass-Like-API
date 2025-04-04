import { z } from 'zod'
import { latitudeSchema, longitudeSchema, uuidSchema } from './common-schemas'

// Schema for the request PARAMS (:gymId)
export const checkInParamsSchema = z.object({
  gymId: uuidSchema,
})

// Schema for the request BODY (user location)
export const createCheckInBodySchema = z.object({
  userLatitude: latitudeSchema,
  userLongitude: longitudeSchema,
})

// Define a schema for the combined data used by the use case for validation
export const createCheckInUseCaseSchema = z.object({
  userId: uuidSchema,
  gymId: uuidSchema,
  userLatitude: latitudeSchema,
  userLongitude: longitudeSchema,
})

// Schema for fetching user check-in history (used in use case)
export const getUserCheckInHistorySchema = z.object({
  userId: uuidSchema,
  page: z.coerce.number().min(1).default(1),
})

// Type for the validated body data
export type CreateCheckInBodyInput = z.infer<typeof createCheckInBodySchema>
// Type for the validated params data (POST /gyms/:gymId/check-ins)
export type CheckInParamsInput = z.infer<typeof checkInParamsSchema>

// Schema for validating check-in route PARAMS (:checkInId)
export const validateCheckInParamsSchema = z.object({
  checkInId: uuidSchema,
})

// Type for the validated params data (PATCH /check-ins/:checkInId/validate)
export type ValidateCheckInParamsInput = z.infer<
  typeof validateCheckInParamsSchema
>

// Schema for getting user metrics (used in use case)
export const getUserMetricsSchema = z.object({
  userId: uuidSchema,
})
