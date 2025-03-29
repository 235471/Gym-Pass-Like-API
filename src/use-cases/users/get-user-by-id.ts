import { UserDTO } from '@/types/user'
import { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { Either, left, right } from '@/types/either'
import { IError } from '@/http/errors/interface/error'
import { NotFoundError } from '@/http/errors/not-found-error'
import { injectable, inject } from 'tsyringe'
import { UserMapper } from '@/utils/user-mapper'

interface GetUserByIdUseCaseRequest {
  id: string
}

type GetUserByIdUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class GetUserByIdUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute({
    id,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const result = await this.userRepository.findById(id)

    if (result.isLeft()) {
      return left(result.value)
    }

    const user = result.value
    if (!user) {
      return left(new NotFoundError(`User with id '${id}' not found`))
    }

    const userDTO = UserMapper.toDTO(user)
    return right(userDTO)
  }
}
