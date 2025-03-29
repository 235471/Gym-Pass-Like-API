import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { IUserController } from './interfaces/IUserController'
import { UserPresenter } from '@/presenters/user-presenter'
import { injectable, inject } from 'tsyringe'
import { handleError } from '../errors/error-handler'
import { RegisterUserUseCase } from '@/use-cases/users/register-user'
import { InternalServerError } from '../errors/internal-server-error'
import {
  formatValidationErrors,
  formatValidationErrorsForHTTP,
} from '@/utils/error-formatter'

@injectable()
export class UserRegisterController implements IUserController {
  private createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long.')
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/,
        'Password must contain at least one uppercase letter, one number, and one special character.',
      ),
  })

  constructor(
    @inject(RegisterUserUseCase.name)
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const validationResult = this.createUserBodySchema.safeParse(request.body)

    if (!validationResult.success) {
      const validationErrors = formatValidationErrors(validationResult.error)
      const formattedErrors = formatValidationErrorsForHTTP(validationErrors)

      return reply.status(400).send({
        error: 'ValidationError',
        message: formattedErrors,
      })
    }

    try {
      const { name, email, password } = validationResult.data

      const result = await this.registerUserUseCase.execute({
        name,
        email,
        password,
      })

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      return reply.status(201).send(UserPresenter.toHTTP(result.value))
    } catch (error) {
      return handleError(new InternalServerError(), reply)
    }
  }
}
