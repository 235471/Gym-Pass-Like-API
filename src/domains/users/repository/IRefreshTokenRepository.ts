import { RefreshToken } from '@prisma/client';
import { CreateRefreshTokenDTO } from '@/application/dtos/refresh-token-dto';
import { Either } from '@/shared/utils/either';
import { IError } from '@/shared/errors/interfaces/error';

export interface IRefreshTokenRepository {
  create(data: CreateRefreshTokenDTO): Promise<Either<IError, RefreshToken>>;
  findByToken(token: string): Promise<Either<IError, RefreshToken | null>>;
  delete(id: string): Promise<Either<IError, void>>;
  deleteByUserId(userId: string): Promise<Either<IError, void>>;
}
