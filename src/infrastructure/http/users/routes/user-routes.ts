import { FastifyInstance } from 'fastify'
import { makeUserController } from '@/infrastructure/factories/makeUserController'
import { makeAuthController } from '@/infrastructure/factories/makeAuthController'
import { verifyJWT } from '../../middlewares/verify-jwt' // Import verifyJWT middleware
import { z } from 'zod'
import { makeProfileController } from '@/infrastructure/factories/makeProfileController'

export async function userRoutes(app: FastifyInstance) {
  const userController = makeUserController()
  const authController = makeAuthController()
  const profileController = makeProfileController()
  
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
        201: z.object({}),
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

  app.post('/auth', {
    schema: {
      summary: 'Authenticate user',
      description: 'Authenticates a user',
      tags: ['users'],
      body: z.object({
        email: z.string(),
        password: z.string(),
      }),
      response: {
        400: z.object({
          error: z.string(),
          message: z.array(
            z.object({
              field: z.string(),
              message: z.string(),
            }),
          ),
        }),
        401: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
        200: z.object({
          accessToken: z.string(),
        }),
      },
    },
    handler: authController.register,
  })

  app.get("/me", {
    onRequest: [verifyJWT], // Apply middleware here
    schema: {
      summary: "Get user profile",
      description: "Get user profile",
      tags: ["users"],
      security: [{ bearerAuth: [] }], // Indicate JWT is required for Swagger
      response: {
        200: z.object({
          user: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.date(),
            updatedAt: z.date().nullable().optional(),
          }),
        }),
        401: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
    // No longer need .bind() as handle is now an arrow function property
    handler: profileController.handle,
  });
}
