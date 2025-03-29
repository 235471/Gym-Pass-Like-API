import { IError } from './interface/error'

export class ConflictError extends Error implements IError {
  constructor(message = 'Conflict') {
    super(message)
  }
}
