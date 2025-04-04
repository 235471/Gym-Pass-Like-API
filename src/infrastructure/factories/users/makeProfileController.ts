import { container } from 'tsyringe'
import { ProfileController } from '../../http/users/controllers/profile'

export function makeProfileController() {
  return container.resolve(ProfileController)
}
