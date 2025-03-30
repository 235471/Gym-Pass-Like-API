import { IError } from './interfaces/error'

export class InvalidCredentialsError extends Error implements IError {
  name = 'InvalidCredentialsError'

  constructor(message = 'Invalid credentials') {
    super(message)
  }
}
