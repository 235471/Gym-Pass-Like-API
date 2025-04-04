import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, right, left } from '@/shared/utils/either'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { UserMetricsDTO } from '../dtos/user-dto'
import { validateData } from '@/shared/utils/validation'
import { getUserMetricsSchema } from '../schemas/check-in-schemas'

type GetUserMetricsUseCaseRequest = {
  userId: string
}
type GetUserMetricsUseCaseResponse = Either<IError, UserMetricsDTO>

@injectable()
export class GetUserMetricsUseCase {
  constructor(
    @inject('CheckInRepository') private checkInRepository: ICheckInRepository,
  ) {}

  async execute(
    data: GetUserMetricsUseCaseRequest,
  ): Promise<GetUserMetricsUseCaseResponse> {
    const validationResult = validateData(getUserMetricsSchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const { userId } = validationResult.value

    const userMetricsResult = await this.checkInRepository.countByUserId(userId)

    if (userMetricsResult.isRight()) {
      return right(userMetricsResult.value)
    }

    return left(userMetricsResult.value)
  }
}
