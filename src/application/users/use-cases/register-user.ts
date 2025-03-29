import { UserDTO, UserRegisterDTO } from '@/application/users/dtos/user'
import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { ConflictError } from '@/shared/errors/conflict-error'
import { injectable, inject } from 'tsyringe'
import { hash } from 'bcryptjs'
import { UserMapper } from '@/shared/utils/user-mapper'
import { z } from 'zod'
import { formatValidationErrors } from '@/shared/utils/error-formatter'
import { ValidationErrors } from '@/shared/errors/validation-errors'

// Schema for request validation
const registerUserSchema = z.object({
  name: z.string().nonempty('Name is required.'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long.')
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/,
      'Password must contain at least one uppercase letter, one number, and one special character.',
    ),
})

// Schema for response
export const registerUserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
})

// Types inferred from schemas
export type RegisterUserUseCaseRequest = z.infer<typeof registerUserSchema>
type RegisterUserUseCaseResponse = Either<IError, UserDTO>

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(data: UserRegisterDTO): Promise<RegisterUserUseCaseResponse> {
    // Validate input data using Zod
    const validationResult = registerUserSchema.safeParse(data)
    if (!validationResult.success) {
      // Return all validation errors together
      const errors = formatValidationErrors(validationResult.error)
      return left(new ValidationErrors(errors))
    }

    const { name, email, password } = validationResult.data

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
