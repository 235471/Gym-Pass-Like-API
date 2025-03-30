import { IError } from './interfaces/error'

export class TooManyRequestsError extends Error implements IError {
  name = 'TooManyRequestsError'

  constructor(
    message = 'You can only check in to one gym per day. Please try again tomorrow.',
  ) {
    super(message)
  }
}
