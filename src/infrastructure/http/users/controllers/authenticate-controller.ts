import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { AuthenticateUseCase } from '@/application/users/use-cases/authenticate'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { AuthenticateUserDTO } from '@/application/users/dtos/user-dto'

@injectable()
export class AuthenticateController {
  constructor(
    @inject(AuthenticateUseCase.name)
    private authenticateUseCase: AuthenticateUseCase,
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

      // Return the access token in the response body
      const { accessToken } = result.value
      return reply.status(200).send({ accessToken })
    } catch (error) {
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : 'Erro interno do servidor',
        ),
        reply,
      )
    }
  }
}
