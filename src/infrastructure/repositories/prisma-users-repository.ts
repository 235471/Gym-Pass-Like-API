import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { PrismaClient, User } from '@prisma/client'
import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { CreateUserDTO } from '@/application/users/dtos/user-dto'

@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<Either<IError, User>> {
    try {
      const user = await this.prisma.user.create({
        data,
      })

      return right(user)
    } catch (error) {
      return left(new InternalServerError('Error creating user'))
    }
  }

  async findByEmail(email: string): Promise<Either<IError, User | null>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

      return right(user)
    } catch (error) {
      return left(new InternalServerError('Error finding user by email'))
    }
  }

  async findById(id: string): Promise<Either<IError, User | null>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      })

      return right(user)
    } catch (error) {
      return left(new InternalServerError('Error finding user by id'))
    }
  }
}
