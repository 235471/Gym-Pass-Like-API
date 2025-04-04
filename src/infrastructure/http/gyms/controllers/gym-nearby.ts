import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { SearchNearbyGymDTO } from '@/application/users/dtos/gym-dto'
import { FetchNearbyGymsUseCase } from '@/application/users/use-cases/fetch-nearby-gyms'
import { GymPresenter } from '@/shared/presenters/gym-presenter'

@injectable()
export class GymNearbyController {
  constructor(
    @inject(FetchNearbyGymsUseCase.name)
    private gymUseCase: FetchNearbyGymsUseCase,
  ) {}

  fetchNearby = async (
    request: FastifyRequest<{ Querystring: SearchNearbyGymDTO }>,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.gymUseCase.execute(request.query)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      if (result.value.length === 0) {
        return reply.status(200).send([])
      }

      const gyms = result.value.map((gym) => GymPresenter.gymListToHTTP(gym))

      return reply.status(200).send(gyms)
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
