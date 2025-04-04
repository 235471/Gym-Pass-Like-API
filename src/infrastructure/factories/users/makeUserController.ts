import { container } from 'tsyringe'
import { UserRegisterController } from '@/infrastructure/http/users/controllers/user-register-controller'

export function makeUserController() {
  return container.resolve(UserRegisterController)
}
