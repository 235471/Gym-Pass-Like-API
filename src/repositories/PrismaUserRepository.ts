import { prisma } from '@/lib/prisma'
import { IUserRepository } from './interfaces/IUserRepository'
import { CreateUserDTO } from '@/types/user'
import { hash } from 'bcryptjs'
import { User } from '@prisma/client'

export class PrismaUserRepository implements IUserRepository {
  async create({ name, email, password }: CreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 6),
      },
    })

    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }
}
