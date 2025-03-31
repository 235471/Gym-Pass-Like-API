import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { RegisterGymDTO } from '@/application/users/dtos/gym-dto'
import { Gym } from '@prisma/client'

export interface IGymRepository {
  create(data: RegisterGymDTO): Promise<Either<IError, Gym>>
  findById(id: string): Promise<Either<IError, Gym | null>>
  searchManyByQuery(query: string, page: number): Promise<Either<IError, Gym[]>>
}
