import { container } from 'tsyringe'
import { GymNearbyController } from '../../http/gyms/controllers/gym-nearby'

export function makeGymNearbyController() {
  return container.resolve(GymNearbyController)
}
