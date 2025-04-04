import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { FetchUserCheckInsHistoryUseCase } from '@/application/users/use-cases/fetch-user-check-ins-history'
import {
  CheckInPageParamsDTO,
  FetchCheckInDTO,
} from '@/application/users/dtos/check-in-dto'
import { CheckInPresenter } from '@/shared/presenters/check-in-presenter'

@injectable()
export class CheckInHistoryController {
  constructor(
    @inject(FetchUserCheckInsHistoryUseCase.name)
    private checkInUseCase: FetchUserCheckInsHistoryUseCase,
  ) {}

  history = async (
    request: FastifyRequest<{ Querystring: CheckInPageParamsDTO }>,
    reply: FastifyReply,
  ) => {
    try {
      const useCaseData: FetchCheckInDTO = {
        userId: request.user.sub,
        page: request.query.page,
      }

      const result = await this.checkInUseCase.execute(useCaseData)

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      if (result.value.checkIns.length === 0) {
        return reply.status(200).send([])
      }

      const checkInHistory = result.value.checkIns.map((checkIn) =>
        CheckInPresenter.checkInListToHTTP(checkIn),
      )

      return reply.status(200).send(checkInHistory)
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
