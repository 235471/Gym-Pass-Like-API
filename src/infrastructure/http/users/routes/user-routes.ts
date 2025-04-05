import { FastifyInstance } from 'fastify'
import { makeUserController } from '@/infrastructure/factories/users/makeUserController'
import { makeAuthController } from '@/infrastructure/factories/users/makeAuthController'
import { z } from 'zod'
import { makeProfileController } from '@/infrastructure/factories/users/makeProfileController'
import { makeRefreshTokenController } from '@/infrastructure/factories/users/makeRefreshTokenController'
import { makeLogoutController } from '@/infrastructure/factories/users/makeLogoutController'
import {
  generalErrorSchema,
  validationErrorSchema,
} from '@/application/schemas/common-schemas'

export async function userRoutes(app: FastifyInstance) {
  const userController = makeUserController()
  const authController = makeAuthController()
  const profileController = makeProfileController()
  const refreshTokenController = makeRefreshTokenController()
  const logoutController = makeLogoutController()

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
        400: validationErrorSchema,
        409: generalErrorSchema,
        500: generalErrorSchema,
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
        400: validationErrorSchema,
        401: generalErrorSchema,
        200: z.object({
          // Only accessToken in body now
          accessToken: z.string(),
        }),
        500: generalErrorSchema,
      },
    },
    handler: authController.register,
  })

  app.post('/refresh', {
    schema: {
      summary: 'Refresh access token',
      description:
        'Obtains a new access token using a refresh token from cookie',
      tags: ['users'],
      // No request body needed, token comes from cookie
      response: {
        200: z.object({
          // Only accessToken in body
          accessToken: z.string(),
        }),
        401: generalErrorSchema,
        500: generalErrorSchema,
      },
    },
    handler: refreshTokenController.handle,
  })

  app.post('/logout', {
    schema: {
      summary: 'Log out user',
      description: "Invalidates the user's current session tokens",
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        204: z.null(),
        500: generalErrorSchema,
      },
    },
    handler: logoutController.handle,
  })

  app.get('/me', {
    schema: {
      summary: 'Get user profile',
      description: 'Get user profile',
      tags: ['users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          user: z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
          }),
        }),
        401: generalErrorSchema,
        500: generalErrorSchema,
      },
    },
    handler: profileController.handle,
  })
}
