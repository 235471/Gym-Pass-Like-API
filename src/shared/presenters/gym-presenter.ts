import { ListGymsDTO } from '@/application/users/dtos/gym-dto'
import { Gym } from '@prisma/client'

export class GymPresenter {
  static gymListToHTTP(gym: Gym): ListGymsDTO {
    return {
      title: gym.title,
      description: gym.description ?? undefined,
      phone: gym.phone ?? undefined,
    }
  }
}
