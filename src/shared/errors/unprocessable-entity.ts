import { IError } from './interfaces/error'

export class UnprocessableEntityError extends Error implements IError {
  name = 'UnprocessableEntityError'
  constructor(message = 'Unprocessable Entity') {
    super(message)
  }
}
