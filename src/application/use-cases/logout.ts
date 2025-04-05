import { injectable, inject } from 'tsyringe'
import { Either, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { IRefreshTokenRepository } from '@/domains/users/repository/IRefreshTokenRepository'
import { LogoutUseCaseInputDTO } from '@/application/dtos/refresh-token-dto' // Use DTO for input

type LogoutUseCaseResponse = Either<IError, void>

@injectable()
export class LogoutUseCase {
  constructor(
    @inject('RefreshTokenRepository')
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(data: LogoutUseCaseInputDTO): Promise<LogoutUseCaseResponse> {
    const { userId } = data

    const deleteResult =
      await this.refreshTokenRepository.deleteByUserId(userId)

    if (deleteResult.isLeft()) {
      // Log the error but proceed to return success for logout regardless
      console.error(
        `Failed to delete refresh tokens during logout for user ${userId}:`,
        deleteResult.value,
      )
      // Decide whether to return left(deleteResult.value) or right(undefined)
      // Returning right() ensures logout appears successful to client even if cleanup failed server-side.
    }

    // Consider logout successful even if token deletion had an issue server-side
    return right(undefined)
  }
}
