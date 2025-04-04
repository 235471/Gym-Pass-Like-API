import { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from "tsyringe";
import { handleError } from "@/shared/errors/error-handler";
import { InternalServerError } from "@/shared/errors/internal-server-error";
import { RegisterGymDTO } from "@/application/users/dtos/gym-dto";
import { CreateGymUseCase } from "@/application/users/use-cases/create-gym";

@injectable()
export class GymRegisterController {
  constructor(
    @inject(CreateGymUseCase.name)
    private gymUseCase: CreateGymUseCase
  ) {}

  register = async (
    request: FastifyRequest<{ Body: RegisterGymDTO }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.gymUseCase.execute(request.body);

      if (result.isLeft()) {
        return handleError(result.value, reply);
      }

      // Send back the ID of the created gym
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
