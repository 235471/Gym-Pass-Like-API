import { container } from 'tsyringe'
import { GymRegisterController } from '../../http/gyms/controllers/gym-register'

export function makeGymController() {
  return container.resolve(GymRegisterController)
}
