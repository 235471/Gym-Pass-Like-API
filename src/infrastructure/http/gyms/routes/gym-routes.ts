import { makeGymController } from '@/infrastructure/factories/gyms/makeGymController'
import { makeCheckInCreateController } from '@/infrastructure/factories/check-ins/makeCheckInCreateController'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { makeGymNearbyController } from '@/infrastructure/factories/gyms/makeNearByGymController'
import { makeGymSearchController } from '@/infrastructure/factories/gyms/makeGymSearch'
import {
  generalErrorSchema,
  validationErrorSchema,
} from '@/application/schemas/common-schemas';
import { verifyUserRole } from '@/infrastructure/http/middlewares/verify-user-role'; 

export async function gymRoutes(app: FastifyInstance) {
  const gymController = makeGymController()
  const gymSearchController = makeGymSearchController()
  const gymNearbyController = makeGymNearbyController()
  const checkInCreateController = makeCheckInCreateController()

  app.post(
    '/',
    {
      onRequest: [verifyUserRole('ADMIN')], // Add role verification middleware
      schema: {
        summary: 'Register a new gym (Admin Only)',
        description: 'Creates a new gym (Requires ADMIN role)',
        tags: ['gyms'],
        security: [{ bearerAuth: [] }],
        body: z.object({
          title: z.string(),
          description: z.string().optional().nullable(),
          phone: z.string().optional().nullable(),
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
          }),
          400: validationErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    gymController.register as any
  )

  app.get(
    '/search',
    {
      schema: {
        summary: 'Search for gyms',
        description: 'Searches gyms by title',
        tags: ['gyms'],
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          query: z.string(),
          page: z.coerce.number().default(1),
        }),
        response: {
          200: z.object({
            gyms: z.array(
              z.object({
                title: z.string(),
                description: z.string().optional(),
                phone: z.string().optional(),
              }),
            ),
          }),
          400: validationErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    gymSearchController.search,
  )

  app.get(
    '/nearby',
    {
      schema: {
        summary: 'Fetch nearby gyms',
        description: 'Fetches gyms within 10km radius',
        tags: ['gyms'],
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          latitude: z.coerce.number(),
          longitude: z.coerce.number(),
        }),
        response: {
          200: z.object({
            gyms: z.array(
              z.object({
                title: z.string(),
                description: z.string().optional(),
                phone: z.string().optional(),
              }),
            ),
          }),
          400: validationErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    gymNearbyController.fetchNearby,
  )

  app.post(
    '/:gymId/check-ins',
    {
      schema: {
        summary: 'Create a check-in for a specific gym',
        description: 'Registers a user check-in at the specified gym',
        tags: ['check-ins'],
        security: [{ bearerAuth: [] }],
        params: z.object({
          gymId: z.string().uuid(),
        }),
        body: z.object({
          userLatitude: z.coerce.number(),
          userLongitude: z.coerce.number(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
          }),
          400: validationErrorSchema,
          404: generalErrorSchema,
          500: generalErrorSchema,
        },
      },
    },
    checkInCreateController.register,
  )
}
