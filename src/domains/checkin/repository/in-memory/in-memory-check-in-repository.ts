import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { CheckIn, Prisma } from '@prisma/client'
import { ICheckInRepository } from '../ICheckInRepository'
import { randomUUID } from 'node:crypto'
import { TooManyRequestsError } from '@/shared/errors/too-many-requests'
import dayjs from 'dayjs'

export class InMemoryCheckInRepository implements ICheckInRepository {
  public items: CheckIn[] = []
  async create(
    data: Prisma.CheckInUncheckedCreateInput,
  ): Promise<Either<IError, CheckIn>> {
    const checkIn = {
      id: randomUUID(),
      userId: data.userId,
      gymId: data.gymId,
      createdAt: new Date(),
      validateAt: data.validateAt ? new Date(data.validateAt) : null,
    }
    this.items.push(checkIn)
    return right(checkIn)
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<Either<IError, CheckIn | null>> {
    const startOfDay = dayjs(date).startOf('day') // Midnight (00:00:00)
    const endOfDay = dayjs(date).endOf('day') // Just before the next day's midnight (23:59:59)

    const checkInOnSameDate = this.items.find(
      (checkIn) =>
        checkIn.userId === userId &&
        dayjs(checkIn.createdAt).isAfter(startOfDay) &&
        dayjs(checkIn.createdAt).isBefore(endOfDay),
    )

    if (!checkInOnSameDate) {
      return right(null)
    } else {
      return left(new TooManyRequestsError())
    }
  }
}
