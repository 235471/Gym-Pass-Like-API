import { prisma } from '@/lib/prisma'
import { IUserRepository } from './interfaces/IUserRepository'
import { CreateUserDTO } from '@/types/user'
import { User } from '@prisma/client'
import { injectable } from 'tsyringe'
import { Either, left, right } from '@/types/either'
import { IError } from '@/http/errors/interface/error'
import { InternalServerError } from '@/http/errors/internal-server-error'

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
