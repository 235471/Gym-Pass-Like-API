import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, right, left } from '@/shared/utils/either'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { FetchCheckInDTO, FetchCheckInHistoryDTO } from '../dtos/check-in-dto'
import { validateData } from '@/shared/utils/validation'
// Correct the schema import name
import { getUserCheckInHistorySchema } from '../schemas/check-in-schemas'

type FetchUserCheckInsHistoryUseCaseResponse = Either<
  IError,
  FetchCheckInHistoryDTO
>

@injectable()
export class FetchUserCheckInsHistoryUseCase {
  constructor(
    @inject('CheckInRepository') private checkInRepository: ICheckInRepository,
  ) {}

  async execute(
    data: FetchCheckInDTO,
  ): Promise<FetchUserCheckInsHistoryUseCaseResponse> {
    // Use the correct schema name for validation
    const validationResult = validateData(getUserCheckInHistorySchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const { userId, page } = validationResult.value

    const checkInList = await this.checkInRepository.findManyByUserId(
      userId,
      page,
    )

    if (checkInList.isRight()) {
      return right({
        checkIns: checkInList.value,
      })
    }

    return left(checkInList.value)
  }
}
