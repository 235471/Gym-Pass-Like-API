import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { handleError } from '@/shared/errors/error-handler';
import { LogoutUseCase } from '@/application/use-cases/logout';
import { InternalServerError } from '@/shared/errors/internal-server-error';

@injectable()
export class LogoutController {
  constructor(
    @inject(LogoutUseCase.name)
    private logoutUseCase: LogoutUseCase,
  ) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.logoutUseCase.execute({ userId: request.user.sub });

      if (result.isLeft()) {
        // Log the error but proceed to return success (204) to the client
        console.error(`LogoutController: Error during token deletion for user ${request.user.sub}:`, result.value);
        // Fall through to return 204
      }

      // Return 204 No Content regardless of token deletion success/failure server-side
      return reply.status(204).send();

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("LogoutController Error:", error);
      }
      const userIdForError = request.user ? request.user.sub : 'unknown';
      return handleError(
        new InternalServerError(
          `Error during logout for user ${userIdForError}: ${error instanceof Error ? error.message : 'Internal server error'}`,
        ),
        reply,
      );
    }
  };
}
