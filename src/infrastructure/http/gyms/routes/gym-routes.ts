import { makeGymController } from '@/infrastructure/factories/gyms/makeGymController'
import { makeCheckInCreateController } from '@/infrastructure/factories/check-ins/makeCheckInCreateController'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { makeGymNearbyController } from '@/infrastructure/factories/gyms/makeNearByGymController'
import { makeGymSearchController } from '@/infrastructure/factories/gyms/makeGymSearch'

export async function gymRoutes(app: FastifyInstance) {
  // Instantiate controllers
  const gymController = makeGymController()
  const gymSearchController = makeGymSearchController()
  const gymNearbyController = makeGymNearbyController()
  const checkInCreateController = makeCheckInCreateController()

  // Register Gym Route (POST /)
  app.post(
    '/',
    {
      schema: {
        summary: 'Register a new gym',
        description: 'Creates a new gym',
        tags: ['gyms'],
        body: z.object({
          title: z.string(),
          description: z.string().optional().nullable(),
          phone: z.string().optional().nullable(),
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: {
          201: z.object({}).optional().nullable(),
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
    gymController.register,
  )

  // Search Gyms Route (GET /search)
  app.get(
    '/search',
    {
      schema: {
        summary: 'Search for gyms',
        description: 'Searches gyms by title',
        tags: ['gyms'],
        querystring: z.object({
          query: z.string(),
          page: z.number().optional(),
        }),
        response: {
          200: z.array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              phone: z.string().optional(),
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
    gymSearchController.search,
  )

  // Nearby Gyms Route (GET /nearby)
  app.get(
    '/nearby',
    {
      schema: {
        summary: 'Fetch nearby gyms',
        description: 'Fetches gyms within 10km radius',
        tags: ['gyms'],
        querystring: z.object({
          latitude: z.coerce.number(),
          longitude: z.coerce.number(),
        }),
        response: {
          200: z.array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              phone: z.string().optional(),
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
    gymNearbyController.fetchNearby,
  )

  // Create Check-in Route (POST /:gymId/check-ins)
  app.post(
    '/:gymId/check-ins',
    {
      schema: {
        summary: 'Create a check-in for a specific gym',
        description: 'Registers a user check-in at the specified gym',
        tags: ['check-ins'],
        params: z.object({
          gymId: z.string(),
        }),
        body: z.object({
          userLatitude: z.number(),
          userLongitude: z.number(),
        }),
        response: {
          201: z.object({}).optional().nullable(),
          400: z.object({
            error: z
              .literal('ValidationError')
              .or(z.literal('BadRequestError')),
            message: z.any(),
          }),
          404: z.object({
            statusCode: z.number(),
            error: z.literal('NotFoundError'),
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
    checkInCreateController.register,
  )
}
