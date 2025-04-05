import { FastifyRequest, FastifyReply } from 'fastify'
import { inject, injectable } from 'tsyringe'
import { GetUserProfileUseCase } from '@/application/use-cases/get-user-profile'

import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { UserPresenter } from '@/shared/presenters/user-presenter'

@injectable()
export class ProfileController {
  constructor(
    @inject(GetUserProfileUseCase.name)
    private getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

  // Change to arrow function syntax
  handle = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // The verifyJWT middleware ensures request.user exists and has the user ID in 'sub'
      const userId = request.user.sub

      const result = await this.getUserProfileUseCase.execute({
        userId,
      })

      // Handle potential errors from the use case
      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      // Send the user profile data on success
      return reply.status(200).send({
        user: UserPresenter.profileToHTTP(result.value),
      })
    } catch (error) {
      // Handle unexpected errors
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : 'Internal server error',
        ),
        reply,
      )
    }
  }
}
