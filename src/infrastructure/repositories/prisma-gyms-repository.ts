import {
  RegisterGymDTO,
  SearchNearbyGymDTO,
} from '@/application/users/dtos/gym-dto'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { Gym, Prisma } from '@prisma/client'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { prisma } from '../database/prisma'

export class PrismaGymsRepository implements IGymRepository {
  async create(data: RegisterGymDTO): Promise<Either<IError, Gym>> {
    try {
      const gym = await prisma.gym.create({
        data,
      })
      return right(gym)
    } catch (error) {
      return left(new InternalServerError('Error creating gym'))
    }
  }

  async findById(id: string): Promise<Either<IError, Gym | null>> {
    try {
      const gym = await prisma.gym.findUnique({
        where: { id },
      })

      if (!gym) {
        return left(new NotFoundError('Gym not found'))
      }

      return right(gym)
    } catch (error) {
      return left(new InternalServerError('Error finding gym'))
    }
  }

  async findManyNearby(
    data: SearchNearbyGymDTO,
  ): Promise<Either<IError, Gym[]>> {
    try {
      const gyms = await prisma.$queryRaw<Gym[]>(
        Prisma.sql`
          SELECT * FROM gyms
          WHERE (6371 * acos(cos(radians(${data.userLatitude})) * cos(radians(latitude))
          * cos(radians(longitude) - radians(${data.userLongitude})) + sin(radians(${data.userLatitude})) 
          * sin(radians(latitude)))) <= 10
        `,
      )

      return right(gyms)
    } catch (error) {
      return left(new InternalServerError('Error finding gym'))
    }
  }

  async searchManyByQuery(
    query: string,
    page: number,
  ): Promise<Either<IError, Gym[]>> {
    try {
      const gyms = await prisma.gym.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        skip: (page - 1) * 20,
        take: 20,
      })

      return right(gyms)
    } catch (error) {
      return left(new InternalServerError('Error searching gyms'))
    }
  }
}
