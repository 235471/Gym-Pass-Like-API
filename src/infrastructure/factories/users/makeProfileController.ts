import { ProfileController } from '@/infrastructure/http/users/controllers/profile-controller'
import { container } from 'tsyringe'

export function makeProfileController() {
  return container.resolve(ProfileController)
}
