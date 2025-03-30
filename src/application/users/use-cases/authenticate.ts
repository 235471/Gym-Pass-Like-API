import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { injectable, inject } from 'tsyringe'
import { AuthenticateUserDTO, UserDTO } from '../dtos/user-dto'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { compare } from 'bcryptjs'
import { UnauthorizedError } from '@/shared/errors/unauthorized-error'
import { UserMapper } from '@/shared/utils/user-mapper'
import { authenticateUserSchema } from '../schemas/user-auth-schemas'
import { validateData } from '@/shared/utils/validation'

type AuthenticateUserUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class AuthenticateUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(
    data: AuthenticateUserDTO,
  ): Promise<AuthenticateUserUseCaseResponse> {
    // Validate input data using the shared validation function
    const validationResult = validateData(authenticateUserSchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const { email, password } = validationResult.value

    // Check if user exists
    const userResult = await this.userRepository.findByEmail(email)

    if (userResult.isLeft()) {
      return left(userResult.value)
    }

    const user = userResult.value

    if (!user) {
      return left(new UnauthorizedError('Invalid credentials'))
    }

    // Verify password
    const doesPasswordMatch = await compare(password, user.passwordHash)

    if (!doesPasswordMatch) {
      return left(new UnauthorizedError('Invalid credentials'))
    }

    return right(UserMapper.toDTO(user))
  }
}
