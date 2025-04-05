import { CheckIn, PrismaClient } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import { Either, left, right } from "@/shared/utils/either";
import { IError } from "@/shared/errors/interfaces/error";
import { InternalServerError } from "@/shared/errors/internal-server-error";
import { CreateCheckInUseCaseDTO } from "@/application/dtos/check-in-dto";
import { ICheckInRepository } from "@/domains/checkin/repository/ICheckInRepository";
import { UserMetricsDTO } from "@/application/dtos/user-dto";
import dayjs from "dayjs";
import { NotFoundError } from "@/shared/errors/not-found-error";

@injectable()
export class PrismaCheckInRepository implements ICheckInRepository {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {}

  async create(
    data: CreateCheckInUseCaseDTO
  ): Promise<Either<IError, CheckIn>> {
    try {
      const checkIn = await this.prisma.checkIn.create({
        data,
      });

      return right(checkIn);
    } catch (error) {
      return left(new InternalServerError("Error creating check in"));
    }
  }

  async save(data: CheckIn): Promise<Either<IError, CheckIn>> {
    try {
      const updatedCheckIn = await this.prisma.checkIn.update({
        where: { id: data.id },
        data,
      });

      return right(updatedCheckIn);
    } catch (error) {
      return left(new InternalServerError("Error updating check in"));
    }
  }

  async findById(id: string): Promise<Either<IError, CheckIn | null>> {
    try {
      const checkIn = await this.prisma.checkIn.findUnique({
        where: { id },
      });

      if (!checkIn) {
        return left(new NotFoundError("Check in not found"));
      }

      return right(checkIn);
    } catch (error) {
      return left(new InternalServerError("Error finding check in"));
    }
  }

  async findManyByUserId(
    userId: string,
    page: number
  ): Promise<Either<IError, CheckIn[]>> {
    try {
      const checkIns = await this.prisma.checkIn.findMany({
        where: { userId },
        skip: (page - 1) * 20,
        take: 20,
      });

      return right(checkIns);
    } catch (error) {
      return left(new InternalServerError("Error finding check ins"));
    }
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date
  ): Promise<Either<IError, CheckIn | null>> {
    try {
      const checkIn = await this.prisma.checkIn.findFirst({
        where: {
          userId,
          createdAt: {
            gte: dayjs(date).startOf("day").toDate(),
            lte: dayjs(date).endOf("day").toDate(),
          },
        },
      });

      return right(checkIn);
    } catch (error) {
      return left(
        new InternalServerError("Error finding check-in by user ID and date")
      );
    }
  }

  async countByUserId(userId: string): Promise<Either<IError, UserMetricsDTO>> {
    try {
      const count = await this.prisma.checkIn.count({
        where: { userId },
      });

      return right({
        checkInsCount: count,
      });
    } catch (error) {
      return left(new InternalServerError("Error counting check ins"));
    }
  }
}
