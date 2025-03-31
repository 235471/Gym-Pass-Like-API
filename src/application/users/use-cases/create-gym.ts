import { RegisterGymDTO } from '@/application/users/dtos/gym-dto'
import { Either, left, right } from '@/shared/utils/either'
import { IError } from '@/shared/errors/interfaces/error'
import { injectable, inject } from 'tsyringe'
import { gymUpsertSchema } from '../schemas/gym-schemas'
import { validateData } from '@/shared/utils/validation'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { Gym } from '@prisma/client'

// Types
type CreateGymUseCaseResponse = Either<IError, Gym>

@injectable()
export class CreateGymUseCase {
  constructor(
    @inject('GymRepository') private gymsRepository: IGymRepository,
  ) {}

  async execute(data: RegisterGymDTO): Promise<CreateGymUseCaseResponse> {
    // Validate input data using the shared validation function
    const validationResult = validateData(gymUpsertSchema, data)
    if (validationResult.isLeft()) {
      return left(validationResult.value)
    }

    const gymResult = await this.gymsRepository.create(data)

    if (gymResult.isLeft()) {
      return left(gymResult.value)
    }

    return right(gymResult.value)
  }
}
