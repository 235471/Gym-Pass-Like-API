import { IError } from '@/shared/errors/interfaces/error'
import { Either, right } from '@/shared/utils/either'
import { CheckIn } from '@prisma/client'
import { ICheckInRepository } from '../ICheckInRepository'
import { CreateCheckInDTO } from '@/application/users/dtos/check-in-dto'
import { randomUUID } from 'node:crypto'

export class InMemoryCheckInRepository implements ICheckInRepository {
  public items: CheckIn[] = []
  async create(data: CreateCheckInDTO): Promise<Either<IError, CheckIn>> {
    const checkIn = {
      id: randomUUID(),
      userId: data.userId,
      gymId: data.gymId,
      createdAt: new Date(),
      validateAt: null,
    }
    this.items.push(checkIn)
    return right(checkIn)
  }
}
