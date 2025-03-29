import { container } from 'tsyringe'
import { UserRegisterController } from '@/infrastructure/controllers/users/user-register-controller'

export function makeUserController() {
  return container.resolve(UserRegisterController)
}
