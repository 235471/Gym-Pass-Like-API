import { UserDTO } from '@/types/user'
import { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { Either, left, right } from '@/types/either'
import { IError } from '@/http/errors/interface/error'
import { ConflictError } from '@/http/errors/conflict-error'
import { injectable, inject } from 'tsyringe'
import { hash } from 'bcryptjs'
import { UserMapper } from '@/utils/user-mapper'

interface RegisterUserUseCaseRequest {
  name: string
  email: string
  password: string
}

type RegisterUserUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const emailCheckResult = await this.userRepository.findByEmail(email)

    if (emailCheckResult.isLeft()) {
      return left(emailCheckResult.value)
    }

    const existingUser = emailCheckResult.value
    if (existingUser) {
      return left(new ConflictError(`Email '${email}' is already in use`))
    }

    const passwordHash = await hash(password, 6)

    const createResult = await this.userRepository.create({
      name,
      email,
      passwordHash,
    })

    if (createResult.isLeft()) {
      return left(createResult.value)
    }

    const userDTO = UserMapper.toDTO(createResult.value)

    return right(userDTO)
  }
}
