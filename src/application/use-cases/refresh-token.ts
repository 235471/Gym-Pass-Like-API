import { injectable, inject } from 'tsyringe';
import crypto from 'node:crypto';
import { Either, left, right } from '@/shared/utils/either';
import { IError } from '@/shared/errors/interfaces/error';
import { IRefreshTokenRepository } from '@/domains/users/repository/IRefreshTokenRepository';
import { IUserRepository } from '@/domains/users/repository/IUserRepository';
import { AuthenticateService } from '@/application/services/authenticate-service';
import {
  RefreshTokenUseCaseInputDTO,
  RefreshTokenUseCaseOutputDTO,
  CreateRefreshTokenDTO,
} from '@/application/dtos/refresh-token-dto';
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'; // Assuming this error is appropriate
import { NotFoundError } from '@/shared/errors/not-found-error';
import { UserMapper } from '@/shared/utils/user-mapper';
import { refreshTokenRequestBodySchema } from '@/application/schemas/refresh-token-schemas'; // Import schema
import { validateData } from '@/shared/utils/validation';

type RefreshTokenUseCaseResponse = Either<IError, RefreshTokenUseCaseOutputDTO>;

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject('RefreshTokenRepository')
    private refreshTokenRepository: IRefreshTokenRepository,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject(AuthenticateService.name)
    private authenticateService: AuthenticateService,
  ) {}

  async execute(
    data: RefreshTokenUseCaseInputDTO,
  ): Promise<RefreshTokenUseCaseResponse> {
    const validationResult = validateData(refreshTokenRequestBodySchema, data);
    if (validationResult.isLeft()) {
      return left(validationResult.value);
    }
    const { refreshToken } = validationResult.value;

    const findTokenResult = await this.refreshTokenRepository.findByToken(
      refreshToken,
    );

    if (findTokenResult.isLeft()) {
      return left(findTokenResult.value);
    }

    const existingToken = findTokenResult.value;

    if (!existingToken || existingToken.expiresAt < new Date()) {
      if (existingToken) {
        // Invalidate all tokens for this user if an invalid/expired one is presented
        await this.refreshTokenRepository.deleteByUserId(existingToken.userId);
      }
      return left(new InvalidCredentialsError('Invalid or expired refresh token.'));
    }

    const userResult = await this.userRepository.findById(existingToken.userId);
    if (userResult.isLeft()) {
      return left(userResult.value);
    }
    const user = userResult.value;
    if (!user) {
      await this.refreshTokenRepository.delete(existingToken.id); // Clean up orphan token
      return left(new NotFoundError('User associated with token not found.'));
    }

    // --- Token Rotation ---
    const deleteResult = await this.refreshTokenRepository.delete(existingToken.id);
    if (deleteResult.isLeft()) {
      console.error("Failed to delete old refresh token during rotation:", deleteResult.value);
      return left(deleteResult.value); // Propagate error
    }

    const newAccessToken = this.authenticateService.generateToken(
      UserMapper.toProfileDTO(user),
    );

    const newRefreshTokenString = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenExpiresAt = new Date();
    newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 30); // 30-day expiry

    const newRefreshTokenData: CreateRefreshTokenDTO = {
      userId: user.id,
      token: newRefreshTokenString,
      expiresAt: newRefreshTokenExpiresAt,
    };

    const createNewTokenResult = await this.refreshTokenRepository.create(
      newRefreshTokenData,
    );
    if (createNewTokenResult.isLeft()) {
      // Log critical failure - couldn't save the new token after deleting the old one.
      console.error("CRITICAL: Failed to save new refresh token during rotation:", createNewTokenResult.value);
      return left(createNewTokenResult.value); // Propagate error
    }

    return right({
      accessToken: newAccessToken,
      newRefreshToken: newRefreshTokenString,
    });
  }
}
