import { FastifyRequest, FastifyReply } from 'fastify'
import { IUserController } from './interfaces/IUserController'
import { UserPresenter } from '@/shared/presenters/user-presenter'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { UserRegisterDTO } from '@/application/users/dtos/user'

@injectable()
export class UserRegisterController implements IUserController {
  constructor(
    @inject(RegisterUserUseCase.name)
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  register = async (
    request: FastifyRequest<{ Body: UserRegisterDTO }>,
    reply: FastifyReply,
  ) => {
    console.log('oi')

    try {
      const result = await this.registerUserUseCase.execute(request.body)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      return reply.status(201).send(UserPresenter.toHTTP(result.value))
    } catch (error) {
      return handleError(new InternalServerError(), reply)
    }
  }
}
