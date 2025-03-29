import { IError } from './interfaces/error'

export class NotFoundError extends Error implements IError {
  constructor(message = 'Resource not found') {
    super(message)
  }
}
