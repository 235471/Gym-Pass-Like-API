import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { SearchNearbyGymDTO } from '@/application/dtos/gym-dto'
import { FetchNearbyGymsUseCase } from '@/application/use-cases/fetch-nearby-gyms'
import { GymPresenter } from '@/shared/presenters/gym-presenter'

@injectable()
export class GymNearbyController {
  constructor(
    @inject(FetchNearbyGymsUseCase.name)
    private gymUseCase: FetchNearbyGymsUseCase,
  ) {}

  fetchNearby = async (
    request: FastifyRequest<{
      Querystring: { latitude: number; longitude: number }
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const { latitude, longitude } = request.query

      // Converter para o formato esperado pelo DTO
      const searchParams: SearchNearbyGymDTO = {
        userLatitude: latitude,
        userLongitude: longitude,
      }

      const result = await this.gymUseCase.execute(searchParams)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      if (result.value.length === 0) {
        return reply.status(200).send([])
      }

      const gyms = result.value.map((gym) => GymPresenter.gymListToHTTP(gym))

      return reply.status(200).send({ gyms })
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
