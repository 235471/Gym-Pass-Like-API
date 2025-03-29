import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { IUserController } from './interfaces/IUserController'
import { UserPresenter } from '@/presenters/user-presenter'
import { injectable, inject } from 'tsyringe'
import { handleError } from '../errors/error-handler'
import { RegisterUserUseCase } from '@/use-cases/users/register-user'

@injectable()
export class UserRegisterController implements IUserController {
  constructor(
    @inject(RegisterUserUseCase.name)
    private registerUserUseCase: RegisterUserUseCase,
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z
        .string()
        .min(6)
        .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/),
    })

    try {
      const { name, email, password } = createUserBodySchema.parse(request.body)

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
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          message: 'Validation error.',
          issues: error.format(),
        })
      }

      return reply.status(500).send({
        message: 'Internal server error.',
      })
    }
  }
}
