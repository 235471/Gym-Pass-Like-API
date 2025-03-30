import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { CheckInDTO, CreateCheckInDTO } from '../dtos/check-in-dto'
import { getDistanceBetweenCoordinates } from '@/shared/utils/get-distance-between-coordinates'
import { BadRequestError } from '@/shared/errors/bad-request-error'

type CheckInUseCaseResponse = Either<IError, CheckInDTO>

@injectable()
export class CheckInUseCase {
  constructor(
    @inject('CheckInRepository') private checkInRepository: ICheckInRepository,
    @inject('CheckInRepository') private gymRepository: IGymRepository,
  ) {}

  async execute(data: CreateCheckInDTO): Promise<CheckInUseCaseResponse> {
    const MAX_DISTANCE_IN_METERS = 100

    const gym = await this.gymRepository.findById(data.gymId)

    if (gym.isLeft()) {
      return left(gym.value)
    }

    const distance = getDistanceBetweenCoordinates(
      { latitude: data.userLatitude, longitude: data.userLongitude },
      {
        latitude: gym.value!.latitude.toNumber(),
        longitude: gym.value!.longitude.toNumber(),
      },
    )

    if (distance > MAX_DISTANCE_IN_METERS) {
      return left(
        new BadRequestError(
          'You are too far away from the gym to perform a check in',
        ),
      )
    }

    const checkInOnSameDay = await this.checkInRepository.findByUserIdOnDate(
      data.userId,
      new Date(),
    )
    if (checkInOnSameDay.isLeft()) {
      return left(checkInOnSameDay.value)
    }
    const checkIn = await this.checkInRepository.create(data)

    if (checkIn.isLeft()) {
      return left(checkIn.value)
    }
    if (!checkIn.value) {
      return left(new NotFoundError())
    }

    return right(checkIn.value)
  }
}
