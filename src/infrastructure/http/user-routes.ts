import { FastifyInstance } from 'fastify'
import { makeUserController } from '@/infrastructure/factories/makeUserController'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  const userController = makeUserController()

  app.post('/', {
    schema: {
      summary: 'Register a new user',
      description: 'Creates a new user account',
      tags: ['users'],
      body: z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      }),
      response: {
        201: z.object({
          data: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
          }),
        }),
        400: z.object({
          error: z.string(),
          message: z.array(
            z.object({
              field: z.string(),
              message: z.string(),
            }),
          ),
        }),
        409: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    handler: userController.register,
  })
}
