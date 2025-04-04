import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { CheckInDTO, CreateCheckInUseCaseDTO } from '../dtos/check-in-dto'
import { getDistanceBetweenCoordinates } from '@/shared/utils/get-distance-between-coordinates'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { createCheckInUseCaseSchema } from '../schemas/check-in-schemas'
import { validateData } from '@/shared/utils/validation'

type CheckInUseCaseResponse = Either<IError, CheckInDTO>

@injectable()
export class CheckInUseCase {
  constructor(
    @inject('CheckInRepository') private checkInRepository: ICheckInRepository,
    @inject('GymRepository') private gymRepository: IGymRepository,
  ) {}

  async execute(
    data: CreateCheckInUseCaseDTO,
  ): Promise<CheckInUseCaseResponse> {
    const validationResult = validateData(createCheckInUseCaseSchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const { userId, gymId, userLatitude, userLongitude } =
      validationResult.value

    const MAX_DISTANCE_IN_METERS = 100

    const gym = await this.gymRepository.findById(gymId)

    if (gym.isLeft()) {
      return left(gym.value)
    }

    const distance = getDistanceBetweenCoordinates(
      {
        latitude: userLatitude,
        longitude: userLongitude,
      },
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
      userId,
      new Date(),
    )
    if (checkInOnSameDay.isLeft()) {
      return left(checkInOnSameDay.value)
    }

    const checkIn = await this.checkInRepository.create({
      userId,
      gymId,
      userLatitude,
      userLongitude,
    })

    if (checkIn.isLeft()) {
      return left(checkIn.value)
    }
    if (!checkIn.value) {
      return left(new NotFoundError())
    }

    return right(checkIn.value)
  }
}
