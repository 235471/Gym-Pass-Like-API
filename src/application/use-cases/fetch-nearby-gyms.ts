import { SearchNearbyGymDTO } from "@/application/dtos/gym-dto";
import { Either, left, right } from "@/shared/utils/either";
import { IError } from "@/shared/errors/interfaces/error";
import { injectable, inject } from "tsyringe";
import { IGymRepository } from "@/domains/gyms/repository/IGymRepository";
import { Gym } from "@prisma/client";

// Types
type FetchNearbyGymsUseCaseResponse = Either<IError, Gym[]>;

@injectable()
export class FetchNearbyGymsUseCase {
  constructor(
    @inject("GymRepository") private gymsRepository: IGymRepository
  ) {}

  async execute(
    data: SearchNearbyGymDTO
  ): Promise<FetchNearbyGymsUseCaseResponse> {
    const gymResult = await this.gymsRepository.findManyNearby(data);

    if (gymResult.isLeft()) {
      return left(gymResult.value);
    }

    return right(gymResult.value);
  }
}
