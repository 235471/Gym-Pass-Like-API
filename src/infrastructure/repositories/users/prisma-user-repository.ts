import { prisma } from '@/infrastructure/database/prisma'
import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { CreateUserDTO } from '@/application/users/dtos/user'
import { User } from '@prisma/client'
import { injectable } from 'tsyringe'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { InternalServerError } from '@/shared/errors/internal-server-error'

@injectable()
export class PrismaUserRepository implements IUserRepository {
  async create(data: CreateUserDTO): Promise<Either<IError, User>> {
    try {
      const user = await prisma.user.create({
        data,
      })

      return right(user)
    } catch (error) {
      return left(new InternalServerError('Error creating user'))
    }
  }

  async findByEmail(email: string): Promise<Either<IError, User | null>> {
    try {
      const user = await prisma.user.findUnique({
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
      const user = await prisma.user.findUnique({
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
