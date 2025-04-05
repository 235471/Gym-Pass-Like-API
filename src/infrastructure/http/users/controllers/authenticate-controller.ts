import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { AuthenticateUseCase } from '@/application/use-cases/authenticate'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { AuthenticateUserDTO } from '@/application/dtos/user-dto'
import { AuthenticateService } from '@/application/services/authenticate-service'

@injectable()
export class AuthenticateController {
  constructor(
    @inject(AuthenticateUseCase.name)
    private authenticateUseCase: AuthenticateUseCase,
    @inject(AuthenticateService.name)
    private authenticateService: AuthenticateService,
  ) {}

  register = async (
    request: FastifyRequest<{ Body: AuthenticateUserDTO }>,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.authenticateUseCase.execute(request.body)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      const { user, refreshToken } = result.value

      const accessToken = this.authenticateService.generateToken(user)

      // Set refresh token in HTTP-only cookie
      reply.setCookie('refreshToken', refreshToken, {
        path: '/', // Accessible for all paths
        secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
        httpOnly: true, // Not accessible via JavaScript
        sameSite: 'strict', // Mitigate CSRF
        // maxAge: 60 * 60 * 24 * 30, // Optional: Set expiry (e.g., 30 days in seconds) - matches DB expiry
      })

      // Send only access token in the body
      return reply.status(200).send({ accessToken })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('AuthenticateController Error:', error)
      }
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : 'Internal server error',
        ),
        reply,
      )
    }
  }
}
