import { IError } from './interfaces/error'

export class NotFoundError extends Error implements IError {
  name = 'NotFoundError'

  constructor(message = 'Resource not found') {
    super(message)
  }
}
