import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { IRefreshTokenRepository } from '@/domains/users/repository/IRefreshTokenRepository' // Import refresh token repo interface
import { injectable, inject } from 'tsyringe'
import { AuthenticateUserDTO, UserProfileDTO } from '../dtos/user-dto' // Import UserProfileDTO
import { CreateRefreshTokenDTO } from '../dtos/refresh-token-dto' // Import DTO
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { compare } from 'bcryptjs'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'
import { UserMapper } from '@/shared/utils/user-mapper'
import { authenticateUserSchema } from '../schemas/user-auth-schemas'
import { validateData } from '@/shared/utils/validation'
import crypto from 'node:crypto'

export interface AuthenticateSuccessResponse {
  user: UserProfileDTO
  refreshToken: string
}

type AuthenticateUserUseCaseResponse = Either<
  IError,
  AuthenticateSuccessResponse
>

@injectable()
export class AuthenticateUseCase {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('RefreshTokenRepository')
    private refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(
    data: AuthenticateUserDTO,
  ): Promise<AuthenticateUserUseCaseResponse> {
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

    const refreshTokenString = crypto.randomBytes(32).toString('hex')
    const refreshTokenExpiresAt = new Date()
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30) // Expires in 30 days

    const refreshTokenData: CreateRefreshTokenDTO = {
      userId: user.id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiresAt,
    }

    const createTokenResult =
      await this.refreshTokenRepository.create(refreshTokenData)

    if (createTokenResult.isLeft()) {
      return left(createTokenResult.value) // Propagate internal error if token creation fails
    }

    return right({
      user: UserMapper.toProfileDTO(user),
      refreshToken: refreshTokenString,
    })
  }
}
