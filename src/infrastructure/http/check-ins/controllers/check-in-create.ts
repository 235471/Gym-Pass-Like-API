import { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from "tsyringe";
import { handleError } from "@/shared/errors/error-handler";
import { InternalServerError } from "@/shared/errors/internal-server-error";
import { CheckInUseCase } from "@/application/users/use-cases/check-in";
import {
  CreateCheckInUseCaseDTO,
  CreateCheckInBodyDTO,
  CreateCheckInParamsDTO,
} from "@/application/users/dtos/check-in-dto";

@injectable()
export class CheckInCreateController {
  constructor(
    @inject(CheckInUseCase.name)
    private checkInUseCase: CheckInUseCase
  ) {}

  register = async (
    request: FastifyRequest<{
      Params: CreateCheckInParamsDTO;
      Body: CreateCheckInBodyDTO;
    }>,
    reply: FastifyReply
  ) => {
    try {
      const { gymId } = request.params;
      const { userLatitude, userLongitude } = request.body;
      const userId = request.user.sub;

      const useCaseData: CreateCheckInUseCaseDTO = {
        userId,
        gymId,
        userLatitude,
        userLongitude,
      };

      const result = await this.checkInUseCase.execute(useCaseData);

      if (result.isLeft()) {
        return handleError(result.value, reply);
      }

      return reply.status(201).send({ id: result.value.id });
    } catch (error) {
      return handleError(
        new InternalServerError(
          error instanceof Error ? error.message : "Internal server error"
        ),
        reply
      );
    }
  };
}
