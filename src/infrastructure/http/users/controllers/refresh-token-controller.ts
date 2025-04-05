import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { handleError } from '@/shared/errors/error-handler';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token';
import { InternalServerError } from '@/shared/errors/internal-server-error';
import { RefreshTokenUseCaseInputDTO } from '@/application/dtos/refresh-token-dto';

@injectable()
export class RefreshTokenController {
  constructor(
    @inject(RefreshTokenUseCase.name)
    private refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  handle = async (
    request: FastifyRequest<{ Body: RefreshTokenUseCaseInputDTO }>,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.refreshTokenUseCase.execute(request.body);

      if (result.isLeft()) {
        return handleError(result.value, reply);
      }

      const { accessToken, newRefreshToken } = result.value;

      return reply.status(200).send({
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("RefreshTokenController Error:", error);
      }
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : 'Internal server error',
        ),
        reply,
      );
    }
  };
}
