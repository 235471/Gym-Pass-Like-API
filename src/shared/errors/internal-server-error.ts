import { IError } from './interfaces/error'

export class InternalServerError extends Error implements IError {
  name = 'InternalServerError'

  constructor(message = 'Internal server error') {
    super(message)
    // Preserva o stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}
