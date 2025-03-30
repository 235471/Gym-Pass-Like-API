import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { injectable, inject } from 'tsyringe'
import { UserDTO } from '../dtos/user'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { UserMapper } from '@/shared/utils/user-mapper'
import { NotFoundError } from '@/shared/errors/not-found-error'

type GetUserProfileUseCaseRequest = {
  userId: string
}
type GetUserProfileUseCaseResponse = Either<IError, UserDTO>

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
    console.log('oi')
    if (!userResult.value) {
      return left(new NotFoundError())
    }

    return right(UserMapper.toDTO(userResult.value))
  }
}
