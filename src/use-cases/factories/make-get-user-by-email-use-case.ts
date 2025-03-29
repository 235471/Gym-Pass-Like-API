import { GetUserByEmailUseCase } from '../users/get-user-by-email'
import { container } from 'tsyringe'

export function makeGetUserByEmailUseCase(): GetUserByEmailUseCase {
  return container.resolve(GetUserByEmailUseCase)
}
