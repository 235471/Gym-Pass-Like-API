import { container } from 'tsyringe'
import { GymSearchController } from '../../http/gyms/controllers/gym-search'

export function makeGymSearchController() {
  return container.resolve(GymSearchController)
}
