import { IError } from './interfaces/error'

export class InternalServerError extends Error implements IError {
  name = 'InternalServerError'

  constructor(message = 'Internal server error') {
    super(message)
    // Preserves stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}
