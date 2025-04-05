import { CreateUserDTO } from '@/application/dtos/user-dto'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, right } from '@/shared/utils/either'
import { User } from '@prisma/client'
import { IUserRepository } from '../IUserRepository'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements IUserRepository {
  public items: User[] = []
  async create(data: CreateUserDTO): Promise<Either<IError, User>> {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: null,
    }

    this.items.push(user)
    return right(user)
  }

  async findByEmail(email: string): Promise<Either<IError, User | null>> {
    const user = this.items.find((user) => user.email === email)
    if (!user) {
      return right(null)
    }
    return right(user)
  }

  async findById(id: string): Promise<Either<IError, User | null>> {
    const user = this.items.find((user) => user.id === id)
    if (!user) {
      return right(null)
    }
    return right(user)
  }
}
