import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { injectable, inject } from 'tsyringe'
import { AuthenticateUserDTO, UserDTO } from '../dtos/user'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { compare } from 'bcryptjs'
import { UnauthorizedError } from '@/shared/errors/unauthorized-error'
import { UserMapper } from '@/shared/utils/user-mapper'
import { ValidationErrors } from '@/shared/errors/validation-errors'
import { formatValidationErrors } from '@/shared/utils/error-formatter'
import { z } from 'zod'

type RegisterUserUseCaseResponse = Either<IError, UserDTO>

// Schema for request validation
const authenticateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long.')
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/,
      'Password must contain at least one uppercase letter, one number, and one special character.',
    ),
})

@injectable()
export class AuthenticateUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(
    data: AuthenticateUserDTO,
  ): Promise<RegisterUserUseCaseResponse> {
    // Validate input data using Zod
    const validationResult = authenticateUserSchema.safeParse(data)
    if (!validationResult.success) {
      // Return all validation errors together
      const errors = formatValidationErrors(validationResult.error)
      return left(new ValidationErrors(errors))
    }
    const { email, password } = data

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

    if (!doesPasswordMatch) {
      return left(new Error('Invalid credentials'))
    }

    return right(UserMapper.toDTO(userResult.value))
  }
}
