import { IError } from './interfaces/error'

export class UnauthorizedError extends Error implements IError {
  name = 'UnauthorizedError'

  constructor(message = 'Unauthorized') {
    super(message)
  }
}
