import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { SearchGymUseCase } from '@/application/use-cases/search-gym'
import { QueryGymNameDTO } from '@/application/dtos/gym-dto'
import { GymPresenter } from '@/shared/presenters/gym-presenter'

@injectable()
export class GymSearchController {
  constructor(
    @inject(SearchGymUseCase.name)
    private gymUseCase: SearchGymUseCase,
  ) {}

  search = async (
    request: FastifyRequest<{ Querystring: QueryGymNameDTO }>,
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
