import { CheckIn } from '@prisma/client'
import { Either } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { CreateCheckInDTO } from '@/application/users/dtos/check-in-dto'
import { UserMetricsDTO } from '@/application/users/dtos/user-dto'

export interface ICheckInRepository {
  create(data: CreateCheckInDTO): Promise<Either<IError, CheckIn>>
  findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<Either<IError, CheckIn | null>>
  findManyByUserId(
    userId: string,
    page: number,
  ): Promise<Either<IError, CheckIn[]>>
  countByUserId(userId: string): Promise<Either<IError, UserMetricsDTO>>
}
