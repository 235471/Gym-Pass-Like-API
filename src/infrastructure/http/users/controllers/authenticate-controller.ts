import { FastifyRequest, FastifyReply } from "fastify";
import { injectable, inject } from "tsyringe";
import { handleError } from "@/shared/errors/error-handler";
import { AuthenticateUseCase } from "@/application/use-cases/authenticate";
import { InternalServerError } from "@/shared/errors/internal-server-error";
import { AuthenticateUserDTO } from "@/application/dtos/user-dto";
import { AuthenticateService } from "@/application/services/authenticate-service";

@injectable()
export class AuthenticateController {
  constructor(
    @inject(AuthenticateUseCase.name)
    private authenticateUseCase: AuthenticateUseCase,
    @inject(AuthenticateService.name)
    private authenticateService: AuthenticateService
  ) {}

  register = async (
    request: FastifyRequest<{ Body: AuthenticateUserDTO }>,
    reply: FastifyReply
  ) => {
    try {
      const result = await this.authenticateUseCase.execute(request.body);

      if (result.isLeft()) {
        return handleError(result.value, reply);
      }

      // Get user from use case result
      const user = result.value;

      // Generate access token using the service
      const accessToken = this.authenticateService.generateToken(user);

      // Return the access token in the response body
      return reply.status(200).send({ accessToken });
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
