import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, right, left } from '@/shared/utils/either'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { FetchCheckInHistoryDTO } from '../dtos/check-in-dto'

type FetchUserCheckInsHistoryUseCaseRequest = {
  userId: string
  page: number
}
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
    data: FetchUserCheckInsHistoryUseCaseRequest,
  ): Promise<FetchUserCheckInsHistoryUseCaseResponse> {
    const checkInList = await this.checkInRepository.findManyByUserId(
      data.userId,
      data.page,
    )

    if (checkInList.isRight()) {
      return right({
        checkIns: checkInList.value,
      })
    }

    return left(checkInList.value)
  }
}
