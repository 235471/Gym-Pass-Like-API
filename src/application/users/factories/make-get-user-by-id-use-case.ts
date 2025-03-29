import { GetUserByIdUseCase } from '../users/get-user-by-id'
import { container } from 'tsyringe'

export function makeGetUserByIdUseCase(): GetUserByIdUseCase {
  return container.resolve(GetUserByIdUseCase)
}
