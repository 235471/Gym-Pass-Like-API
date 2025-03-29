import { IError } from './interface/error'

export class InternalServerError extends Error implements IError {
  constructor(message = 'Internal server error') {
    super(message)
  }
}
