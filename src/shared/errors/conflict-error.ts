import { IError } from './interfaces/error'

export class ConflictError extends Error implements IError {
  name = 'ConflictError'

  constructor(message = 'Conflict') {
    super(message)
  }
}
