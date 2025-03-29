import { FastifyRequest, FastifyReply } from 'fastify'
import { IUserController } from './interfaces/IUserController'
import { UserPresenter } from '@/presenters/user-presenter'
import { injectable, inject } from 'tsyringe'
import { handleError } from '../errors/error-handler'
import { RegisterUserUseCase } from '@/use-cases/users/register-user'
import { InternalServerError } from '../errors/internal-server-error'
import { UserRegisterDTO } from '@/types/user'

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
