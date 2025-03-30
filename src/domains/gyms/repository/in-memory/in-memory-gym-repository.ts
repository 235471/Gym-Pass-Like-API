import { IGymRepository } from '../IGymRepository'
import { IError } from '@/shared/errors/interfaces/error'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { Either, left, right } from '@/shared/utils/either'
import { Gym } from '@prisma/client'

export class InMemoryGymRepository implements IGymRepository {
  public items: Gym[] = []
  async findById(id: string): Promise<Either<IError, Gym | null>> {
    const gym = this.items.find((gym) => gym.id === id)
    if (!gym) {
      return left(new NotFoundError())
    }
    return right(gym)
  }
}
