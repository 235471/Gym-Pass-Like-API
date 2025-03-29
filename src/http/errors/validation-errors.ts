import { IError } from './interface/error'
import { ValidationError } from './valdiation-error'

export class ValidationErrors implements IError {
  name = 'ValidationErrors'
  message = 'Validation failed'
  errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    this.errors = errors
  }
}
