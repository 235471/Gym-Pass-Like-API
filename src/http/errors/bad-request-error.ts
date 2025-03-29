import { IError } from './interface/error'

export class BadRequestError extends Error implements IError {
  constructor(message = 'Bad request') {
    super(message)
  }
}
