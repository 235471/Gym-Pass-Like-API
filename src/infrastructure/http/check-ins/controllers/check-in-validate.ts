import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { handleError } from '@/shared/errors/error-handler'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { ValidateCheckInParamsDTO } from '@/application/dtos/check-in-dto'
import { ValidateCheckInUseCase } from '@/application/use-cases/validate-check-in'

@injectable()
export class CheckInValidateController {
  constructor(
    @inject(ValidateCheckInUseCase.name)
    private checkInUseCase: ValidateCheckInUseCase,
  ) {}

  validate = async (
    request: FastifyRequest<{
      Params: ValidateCheckInParamsDTO
    }>,
    reply: FastifyReply,
  ) => {
    try {
      const { checkInId } = request.params

      const result = await this.checkInUseCase.execute({ id: checkInId })

      if (result.isLeft()) {
        return handleError(result.value, reply)
      }

      return reply.status(204).send()
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
