import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { Gym } from '@prisma/client'

export interface IGymRepository {
  findById(id: string): Promise<Either<IError, Gym | null>>
}
