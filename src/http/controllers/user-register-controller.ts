import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { IUserService } from '@/services/interfaces/IUserService'
import { CreateUserDTO } from '@/types/user'
import { IUserController } from './interfaces/IUserController'
import { UserPresenter } from '@/presenters/UserPresenter'

export class UserRegisterController implements IUserController {
  constructor(private userService: IUserService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z
        .string()
        .min(6)
        .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const userData: CreateUserDTO = {
      name,
      email,
      password,
    }

    const user = await this.userService.create(userData)

    return reply.status(201).send(UserPresenter.toHTTP(user))
  }
}
