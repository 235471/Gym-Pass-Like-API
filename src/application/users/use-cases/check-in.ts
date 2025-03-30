import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { CheckInDTO, CreateCheckInDTO } from '../dtos/check-in-dto'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'

type CheckInUseCaseResponse = Either<IError, CheckInDTO>

@injectable()
export class CheckInUseCase {
  constructor(
    @inject('CheckInRepository') private checkInRepository: ICheckInRepository,
  ) {}

  async execute(data: CreateCheckInDTO): Promise<CheckInUseCaseResponse> {
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
