import { RefreshToken } from '@prisma/client';
import { CreateRefreshTokenDTO } from '@/application/dtos/refresh-token-dto';
import { Either, right } from '@/shared/utils/either';
import { IError } from '@/shared/errors/interfaces/error';
import { IRefreshTokenRepository } from '../IRefreshTokenRepository';
import { randomUUID } from 'node:crypto';

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  public items: RefreshToken[] = [];

  async create(data: CreateRefreshTokenDTO): Promise<Either<IError, RefreshToken>> {
    const refreshToken: RefreshToken = {
      id: randomUUID(),
      token: data.token,
      expiresAt: data.expiresAt,
      userId: data.userId,
      createdAt: new Date(),
    };
    this.items.push(refreshToken);
    return right(refreshToken);
  }

  async findByToken(token: string): Promise<Either<IError, RefreshToken | null>> {
    const foundToken = this.items.find((item) => item.token === token);
    return right(foundToken || null);
  }

  async delete(id: string): Promise<Either<IError, void>> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index > -1) {
      this.items.splice(index, 1);
    }
    return right(undefined);
  }

  async deleteByUserId(userId: string): Promise<Either<IError, void>> {
    this.items = this.items.filter((item) => item.userId !== userId);
    return right(undefined);
  }
}
