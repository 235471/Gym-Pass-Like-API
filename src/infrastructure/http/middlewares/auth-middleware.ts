import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '@/shared/errors/error-handler'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'

// Public routes
const publicRoutes = [
  { method: 'POST', url: '/users' },
  { method: 'POST', url: '/users/auth' },
  { method: 'POST', url: '/users/refresh' },
  { method: 'GET', url: '/' },
  { method: 'GET', url: '/docs' },
  { method: 'GET', url: '/docs/*' },
]

export function setupAuthMiddleware(app: FastifyInstance) {
  app.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Check if the current route is in the public routes list
      const isPublicRoute = publicRoutes.some((route) => {
        const urlMatches = route.url.endsWith('*')
          ? request.url.startsWith(route.url.slice(0, -1))
          : request.url === route.url

        return request.method === route.method && urlMatches
      })

      // If it's a public route, allow access without JWT verification
      if (isPublicRoute) {
        return
      }

      // If it's not a public route, verify the JWT
      try {
        await request.jwtVerify()
      } catch (err) {
        return handleError(new InvalidCredentialsError('Not authorized'), reply)
      }
    },
  )
}
