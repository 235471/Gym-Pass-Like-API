import { RegisterGymDTO, SearchNearbyGymDTO } from '@/application/dtos/gym-dto'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { Gym, Prisma, PrismaClient } from '@prisma/client'
import { InternalServerError } from '@/shared/errors/internal-server-error'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { injectable, inject } from 'tsyringe'

@injectable()
export class PrismaGymsRepository implements IGymRepository {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async create(data: RegisterGymDTO): Promise<Either<IError, Gym>> {
    try {
      const gym = await this.prisma.gym.create({
        data,
      })
      return right(gym)
    } catch (error) {
      return left(new InternalServerError('Error creating gym'))
    }
  }

  async findById(id: string): Promise<Either<IError, Gym | null>> {
    try {
      const gym = await this.prisma.gym.findUnique({
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
      // Use the injected prisma client for raw queries too
      const gyms = await this.prisma.$queryRaw<Gym[]>(
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
      const gyms = await this.prisma.gym.findMany({
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
