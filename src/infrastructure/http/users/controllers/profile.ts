import { FastifyRequest, FastifyReply } from 'fastify'
import { container, inject, injectable } from 'tsyringe'
import { GetUserProfileUseCase } from '@/application/users/use-cases/get-user-profile'

@injectable()
export class ProfileController {
  constructor(
    @inject(GetUserProfileUseCase.name)
    private getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const getUserProfileUseCase = container.resolve(GetUserProfileUseCase)

    const { user } = request

    const { user } = await getUserProfileUseCase.execute({
      userId: user.sub,
    })

    return reply.status(200).send({
      user: user.value,
    })
  }
}
