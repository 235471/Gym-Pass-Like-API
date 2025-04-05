import { PrismaClient, RefreshToken } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { Either, left, right } from '@/shared/utils/either';
import { IError } from '@/shared/errors/interfaces/error';
import { InternalServerError } from '@/shared/errors/internal-server-error';
import { IRefreshTokenRepository } from '@/domains/users/repository/IRefreshTokenRepository';
import { CreateRefreshTokenDTO } from '@/application/dtos/refresh-token-dto';

@injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async create(data: CreateRefreshTokenDTO): Promise<Either<IError, RefreshToken>> {
    try {
      const refreshToken = await this.prisma.refreshToken.create({
        data: {
          userId: data.userId,
          token: data.token,
          expiresAt: data.expiresAt,
        },
      });
      return right(refreshToken);
    } catch (error) {
      console.error('Error creating refresh token:', error);
      return left(new InternalServerError('Error creating refresh token'));
    }
  }

  async findByToken(token: string): Promise<Either<IError, RefreshToken | null>> {
    try {
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: {
          token,
        },
      });
      return right(refreshToken);
    } catch (error) {
      console.error('Error finding refresh token by token:', error);
      return left(new InternalServerError('Error finding refresh token'));
    }
  }

  async delete(id: string): Promise<Either<IError, void>> {
    try {
      await this.prisma.refreshToken.delete({
        where: {
          id,
        },
      });
      return right(undefined);
    } catch (error) {
      console.error('Error deleting refresh token by ID:', error);
      return left(new InternalServerError('Error deleting refresh token'));
    }
  }

  async deleteByUserId(userId: string): Promise<Either<IError, void>> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
        },
      });
      return right(undefined);
    } catch (error) {
      console.error('Error deleting refresh tokens by user ID:', error);
      return left(new InternalServerError('Error deleting user refresh tokens'));
    }
  }
}
