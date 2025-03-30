import { CheckIn } from '@prisma/client'
import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { CreateCheckInDTO } from '@/application/users/dtos/check-in-dto'

export interface ICheckInRepository {
  create(data: CreateCheckInDTO): Promise<Either<IError, CheckIn>>
  findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<Either<IError, CheckIn | null>>
}
