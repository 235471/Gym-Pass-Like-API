import { injectable, inject } from 'tsyringe'
import { IError } from '@/shared/errors/interfaces/error'
import { Either, left, right } from '@/shared/utils/either'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { ValidateCheckInDTO, CheckInDTO } from '../dtos/check-in-dto'
import { CheckIn } from '@prisma/client'

type ValidateCheckInUseCaseResponse = Either<IError, CheckInDTO>

@injectable()
export class ValidateCheckInUseCase {
  constructor(
    @inject('CheckInRepository')
    private checkInRepository: ICheckInRepository,
  ) {}

  async execute(
    data: ValidateCheckInDTO,
  ): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInRepository.findById(data.id)

    if (checkIn.isLeft()) {
      return left(checkIn.value)
    }

    const checkInData = checkIn.value as CheckIn
    checkInData.validateAt = new Date()

    await this.checkInRepository.save(checkInData)

    return right(checkInData)
  }
}
