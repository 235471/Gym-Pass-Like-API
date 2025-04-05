import { QueryGymNameDTO } from "@/application/dtos/gym-dto";
import { Either, left, right } from "@/shared/utils/either";
import { IError } from "@/shared/errors/interfaces/error";
import { injectable, inject } from "tsyringe";
import { IGymRepository } from "@/domains/gyms/repository/IGymRepository";
import { Gym } from "@prisma/client";

// Types
type SearchGymUseCaseResponse = Either<IError, Gym[]>;

@injectable()
export class SearchGymUseCase {
  constructor(
    @inject("GymRepository") private gymsRepository: IGymRepository
  ) {}

  async execute(data: QueryGymNameDTO): Promise<SearchGymUseCaseResponse> {
    const gymResult = await this.gymsRepository.searchManyByQuery(
      data.title,
      data.page
    );

    if (gymResult.isLeft()) {
      return left(gymResult.value);
    }

    return right(gymResult.value);
  }
}
