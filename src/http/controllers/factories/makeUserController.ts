import { container } from 'tsyringe'
import { UserRegisterController } from '../user-register-controller'

export function makeUserController(): UserRegisterController {
  return container.resolve(UserRegisterController)
}
