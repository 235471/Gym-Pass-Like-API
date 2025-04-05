import { UserDTO, RegisterUserDTO } from '@/application/dtos/user-dto'
import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { ConflictError } from '@/shared/errors/conflict-error'
import { injectable, inject } from 'tsyringe'
import { hash } from 'bcryptjs'
import { UserMapper } from '@/shared/utils/user-mapper'
import { registerUserSchema } from '../schemas/user-auth-schemas'
import { validateData } from '@/shared/utils/validation'

// Types
type RegisterUserUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(data: RegisterUserDTO): Promise<RegisterUserUseCaseResponse> {
    data.name = data.name.trim()
    data.email = data.email.trim()
    // Validate input data using the shared validation function
    const validationResult = validateData(registerUserSchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const { name, email, password } = validationResult.value

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

    return right(UserMapper.toDTO(createResult.value))
  }
}
