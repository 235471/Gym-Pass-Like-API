import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { makeCheckInHistoryController } from '@/infrastructure/factories/check-ins/makeCheckInHistoryController'
import { makeCheckInValidateController } from '@/infrastructure/factories/check-ins/makeCheckInValidateController'
import { makeCheckInMetricsController } from '@/infrastructure/factories/check-ins/makeCheckInMetricsController'
import {
  generalErrorSchema,
  validationErrorSchema,
} from '@/application/schemas/common-schemas'

export async function checkInsRoutes(app: FastifyInstance) {
  const checkInHistoryController = makeCheckInHistoryController()
  const checkInValidateController = makeCheckInValidateController()
  const checkInMetricsController = makeCheckInMetricsController()

  app.get(
    '/history',
    {
      schema: {
        summary: "Fetch user's check-in history",
        description: "Retrieves a paginated list of the user's check-ins",
        tags: ['check-ins'],
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          page: z.coerce.number().default(1),
        }),
        response: {
          200: z.object({
            checkIns: z.array(
              z.object({
                id: z.string().uuid(),
                userId: z.string().uuid(),
                gymId: z.string().uuid(),
              }),
            ),
          }),
          400: validationErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    checkInHistoryController.history,
  )

  app.get(
    '/metrics',
    {
      schema: {
        summary: "Get user's check-in count",
        description: 'Retrieves the total number of check-ins for the user',
        tags: ['check-ins'],
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            checkInsCount: z.number(),
          }),
          400: validationErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    checkInMetricsController.metric,
  )

  app.patch(
    '/:checkInId/validate',
    {
      schema: {
        summary: 'Validate a check-in',
        description: 'Validates an existing check-in if within the time window',
        tags: ['check-ins'],
        security: [{ bearerAuth: [] }],
        params: z.object({
          checkInId: z.string(),
        }),
        response: {
          204: z.null(),
          400: validationErrorSchema,
          404: generalErrorSchema,
          422: generalErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    checkInValidateController.validate,
  )
}
