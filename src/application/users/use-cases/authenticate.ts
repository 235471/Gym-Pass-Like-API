import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { injectable, inject } from 'tsyringe'
import { AuthenticateUserDTO, UserDTO } from '../dtos/user-dto'
import { IError } from '@/shared/errors/interfaces/error'
import jwt from 'jsonwebtoken'
import { env } from '@/env'
import { Either, left, right } from '@/shared/utils/either'
import { compare } from 'bcryptjs'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'
import { UserMapper } from '@/shared/utils/user-mapper'
import { authenticateUserSchema } from '../schemas/user-auth-schemas'
import { validateData } from '@/shared/utils/validation'

interface IAuthenticateResponse {
  user: UserDTO
  accessToken: string
}

type AuthenticateUserUseCaseResponse = Either<IError, IAuthenticateResponse>

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
      return left(new InvalidCredentialsError())
    }

    // Verify password
    const doesPasswordMatch = await compare(password, user.passwordHash)

    if (!doesPasswordMatch) {
      return left(new InvalidCredentialsError())
    }

    // Generate JWT
    // Decode the Base64 private key before using it
    const privateKey = Buffer.from(env.JWT_PRIVATE_KEY, 'base64')
    const accessToken = jwt.sign({}, privateKey, {
      algorithm: 'RS256',
      subject: user.id,
      expiresIn: '7d', // Token expires in 7 days
    })

    return right({
      user: UserMapper.toDTO(user),
      accessToken,
    })
  }
}
