import { User } from '@prisma/client'
import { CreateUserDTO } from '@/application/users/dtos/user'
import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<Either<IError, User>>
  findByEmail(email: string): Promise<Either<IError, User | null>>
  findById(id: string): Promise<Either<IError, User | null>>
}
