import { IError } from './interfaces/error'
import { ValidationError } from './validation-error'

export class ValidationErrors implements IError {
  name = 'ValidationErrors'
  message = 'Validation failed'
  errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    this.errors = errors
  }
}
