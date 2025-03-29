import { UserDTO } from '@/types/user'
import { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { Either, left, right } from '@/types/either'
import { IError } from '@/http/errors/interface/error'
import { NotFoundError } from '@/http/errors/not-found-error'
import { injectable, inject } from 'tsyringe'
import { UserMapper } from '@/utils/user-mapper'

interface GetUserByEmailUseCaseRequest {
  email: string
}

type GetUserByEmailUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class GetUserByEmailUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute({
    email,
  }: GetUserByEmailUseCaseRequest): Promise<GetUserByEmailUseCaseResponse> {
    const result = await this.userRepository.findByEmail(email)

    if (result.isLeft()) {
      return left(result.value)
    }

    const user = result.value
    if (!user) {
      return left(new NotFoundError(`User with email '${email}' not found`))
    }

    const userDTO = UserMapper.toDTO(user)
    return right(userDTO)
  }
}
