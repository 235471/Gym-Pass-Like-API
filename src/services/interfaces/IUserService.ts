import { CreateUserDTO, UserDTO } from '@/types/user'
import { Either } from '@/types/either'
import { IError } from '@/http/errors/interface/error'

export interface IUserService {
  create(data: CreateUserDTO): Promise<Either<IError, UserDTO>>
  findByEmail(email: string): Promise<Either<IError, UserDTO | null>>
  findById(id: string): Promise<Either<IError, UserDTO | null>>
}
