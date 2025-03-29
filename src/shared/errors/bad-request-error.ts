import { IError } from './interfaces/error'

export class BadRequestError extends Error implements IError {
  name = 'BadRequestError'

  constructor(message = 'Bad request') {
    super(message)
  }
}
