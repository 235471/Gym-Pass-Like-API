import { RegisterUserUseCase } from '../users/register-user'
import { container } from 'tsyringe'

export function makeRegisterUserUseCase(): RegisterUserUseCase {
  return container.resolve(RegisterUserUseCase)
}
