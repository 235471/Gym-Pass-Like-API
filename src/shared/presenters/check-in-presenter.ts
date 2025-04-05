import { ListCheckInDTO } from '@/application/dtos/check-in-dto'
import { CheckIn } from '@prisma/client'

export class CheckInPresenter {
  static checkInListToHTTP(checkIn: CheckIn): ListCheckInDTO {
    return {
      id: checkIn.id,
      userId: checkIn.userId,
      gymId: checkIn.gymId,
    }
  }
}
