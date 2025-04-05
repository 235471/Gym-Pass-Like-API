import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { RegisterUserUseCase } from '@/application/use-cases/register-user'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { RegisterUserDTO } from '@/application/dtos/user-dto'

@injectable()
export class UserRegisterController {
  constructor(
    @inject(RegisterUserUseCase.name)
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  register = async (
    request: FastifyRequest<{ Body: RegisterUserDTO }>,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.registerUserUseCase.execute(request.body)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      return reply.status(201).send()
    } catch (error) {
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : 'Internal server error',
        ),
        reply,
      )
    }
  }
}
