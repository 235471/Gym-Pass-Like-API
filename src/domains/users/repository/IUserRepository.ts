import { User } from '@prisma/client'
import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { CreateUserDTO } from '@/application/dtos/user-dto'

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<Either<IError, User>>
  findByEmail(email: string): Promise<Either<IError, User | null>>
  findById(id: string): Promise<Either<IError, User | null>>
}
