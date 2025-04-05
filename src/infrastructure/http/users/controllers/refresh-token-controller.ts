import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token'
import { InternalServerError } from '@/shared/errors/internal-server-error'

@injectable()
export class RefreshTokenController {
  constructor(
    @inject(RefreshTokenUseCase.name)
    private refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Read refresh token from cookie
      const refreshTokenFromCookie = request.cookies.refreshToken

      // Pass the cookie value to the use case
      const result = await this.refreshTokenUseCase.execute({
        refreshToken: refreshTokenFromCookie || '',
      })

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      const { accessToken, newRefreshToken } = result.value

      // Set the *new* refresh token in an HTTP-only cookie
      reply.setCookie('refreshToken', newRefreshToken, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
      })

      // Send only the new access token in the body
      return reply.status(200).send({ accessToken })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('RefreshTokenController Error:', error)
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
