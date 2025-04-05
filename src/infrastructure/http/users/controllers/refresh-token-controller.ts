import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token'
import { InternalServerError } from '@/shared/errors/internal-server-error'
// Input DTO is no longer needed directly from body
// import { RefreshTokenUseCaseInputDTO } from '@/application/dtos/refresh-token-dto';

@injectable()
export class RefreshTokenController {
  constructor(
    @inject(RefreshTokenUseCase.name)
    private refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  handle = async (
    request: FastifyRequest, // No specific body type needed now
    reply: FastifyReply,
  ) => {
    try {
      // Read refresh token from cookie
      const refreshTokenFromCookie = request.cookies.refreshToken

      // Pass the cookie value to the use case
      const result = await this.refreshTokenUseCase.execute({
        refreshToken: refreshTokenFromCookie || '', // Pass empty string if cookie missing
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
        // maxAge: 60 * 60 * 24 * 30, // Optional: Set expiry
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
