import { prisma } from '@/infrastructure/database/prisma'
import { CheckIn } from '@prisma/client'
import { injectable } from 'tsyringe'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { CreateCheckInDTO } from '@/application/users/dtos/check-in-dto'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'

@injectable()
export class PrismaCheckInRepository implements ICheckInRepository {
  async create(data: CreateCheckInDTO): Promise<Either<IError, CheckIn>> {
    try {
      const checkIn = await prisma.checkIn.create({
        data,
      })

      return right(checkIn)
    } catch (error) {
      return left(new InternalServerError('Error creating check in'))
    }
  }
}
