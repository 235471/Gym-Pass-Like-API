import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { User } from '@prisma/client'

type GetUserProfileUseCaseRequest = {
  userId: string
}

type GetUserProfileUseCaseResponse = Either<IError, User>

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(
    data: GetUserProfileUseCaseRequest,
  ): Promise<GetUserProfileUseCaseResponse> {
    const userResult = await this.userRepository.findById(data.userId)

    if (userResult.isLeft()) {
      return left(userResult.value)
    }

    if (!userResult.value) {
      return left(new NotFoundError())
    }

    return right(userResult.value)
  }
}
