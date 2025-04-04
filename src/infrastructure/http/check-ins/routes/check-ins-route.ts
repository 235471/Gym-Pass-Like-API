import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { makeCheckInHistoryController } from '@/infrastructure/factories/check-ins/makeCheckInHistoryController'
import { makeCheckInValidateController } from '@/infrastructure/factories/check-ins/makeCheckInValidateController'
import { makeCheckInMetricsController } from '@/infrastructure/factories/check-ins/makeCheckInMetricsController' // Import metrics factory

export async function checkInsRoutes(app: FastifyInstance) {
  const checkInHistoryController = makeCheckInHistoryController()
  const checkInValidateController = makeCheckInValidateController()
  const checkInMetricsController = makeCheckInMetricsController()

  // Fetch Check-in History Route
  app.get(
    '/history',
    {
      schema: {
        summary: "Fetch user's check-in history",
        description: "Retrieves a paginated list of the user's check-ins",
        tags: ['check-ins'],
        querystring: z.object({
          page: z.number().optional(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              userId: z.string().uuid(),
              gymId: z.string().uuid(),
            }),
          ),
          400: z.object({
            error: z.literal('ValidationError'),
            message: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
              }),
            ),
          }),
          500: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    checkInHistoryController.history,
  )

  // Validate Check-in Route
  app.patch(
    '/:checkInId/validate',
    {
      schema: {
        summary: 'Validate a check-in',
        description: 'Validates an existing check-in if within the time window',
        tags: ['check-ins'],
        params: z.object({
          checkInId: z.string(),
        }),
        response: {
          204: z.null(),
          400: z.object({
            error: z.literal('ValidationError'),
            message: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
              }),
            ),
          }),
          404: z.object({
            statusCode: z.number(),
            error: z.literal('NotFoundError'),
            message: z.string(),
          }),
          422: z.object({
            statusCode: z.number(),
            error: z.literal('UnprocessableEntityError'),
            message: z.string(),
          }),
          500: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    checkInValidateController.validate,
  )

  // Get User Metrics Route
  app.get(
    '/metrics',
    {
      schema: {
        summary: "Get user's check-in count",
        description: 'Retrieves the total number of check-ins for the user',
        tags: ['check-ins'],
        response: {
          200: z.object({
            checkInsCount: z.number(),
          }),
          400: z.object({
            error: z.literal('ValidationError'),
            message: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
              }),
            ),
          }),
          500: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    checkInMetricsController.metric,
  )
}
