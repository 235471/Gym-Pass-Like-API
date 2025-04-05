import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { GetUserMetricsUseCase } from '@/application/use-cases/get-user-metrics'

@injectable()
export class CheckInMetricsController {
  constructor(
    @inject(GetUserMetricsUseCase.name)
    private checkInUseCase: GetUserMetricsUseCase,
  ) {}

  metric = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user.sub
      const result = await this.checkInUseCase.execute({ userId })

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      return reply
        .status(200)
        .send({ checkInsCount: result.value.checkInsCount })
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
