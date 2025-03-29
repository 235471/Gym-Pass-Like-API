import { User } from '@prisma/client'
import { CreateUserDTO } from '@/types/user'
import { Either } from '@/types/either'
import { IError } from '@/http/errors/interface/error'

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<Either<IError, User>>
  findByEmail(email: string): Promise<Either<IError, User | null>>
  findById(id: string): Promise<Either<IError, User | null>>
}
