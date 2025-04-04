import { container } from 'tsyringe'
import { AuthenticateController } from '../../http/users/controllers/authenticate-controller'

export function makeAuthController() {
  return container.resolve(AuthenticateController)
}
