import { IError } from './interfaces/error'

export class ValidationError extends Error implements IError {
  constructor(
    public field: string,
    public message: string,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
