import {
  GymDTO,
  RegisterGymDTO,
  SearchNearbyGymDTO,
} from '@/application/dtos/gym-dto'
import { IGymRepository } from '../IGymRepository'
import { IError } from '@/shared/errors/interfaces/error'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { Either, left, right } from '@/shared/utils/either'
import { Gym } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'node:crypto'
import { getDistanceBetweenCoordinates } from '@/shared/utils/get-distance-between-coordinates'

export class InMemoryGymRepository implements IGymRepository {
  public items: Gym[] = []

  async create(data: GymDTO | RegisterGymDTO): Promise<Either<IError, Gym>> {
    const gym = {
      id: 'id' in data ? data.id : randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Decimal(data.latitude),
      longitude: new Decimal(data.longitude),
      createdAt: new Date(),
    }

    this.items.push(gym)
    return right(gym)
  }

  async findById(id: string): Promise<Either<IError, Gym | null>> {
    const gym = this.items.find((gym) => gym.id === id)
    if (!gym) {
      return left(new NotFoundError())
    }
    return right(gym)
  }

  async searchManyByQuery(
    query: string,
    page: number,
  ): Promise<Either<IError, Gym[]>> {
    const gyms = this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20)

    return right(gyms)
  }

  async findManyNearby(
    data: SearchNearbyGymDTO,
  ): Promise<Either<IError, Gym[]>> {
    const nearbyGyms = this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: data.userLatitude, longitude: data.userLongitude },
        {
          latitude: item.latitude.toNumber(),
          longitude: item.longitude.toNumber(),
        },
      )
      return distance / 1000 < 10
    })

    return right(nearbyGyms)
  }
}
