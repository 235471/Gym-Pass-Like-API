import { ZodError } from 'zod'
import { ValidationError } from '@/shared/errors/validation-error'

export function formatValidationErrors(error: ZodError) {
  // Map zod errors to ValidationError instances
  return error.issues.map(
    (issue) => new ValidationError(issue.path.join('.'), issue.message),
  )
}

export function formatValidationErrorsForHTTP(errors: ValidationError[]) {
  // Transforms ValidationError to HTTP response format
  return errors.map((error) => ({
    field: error.field,
    message: error.message,
  }))
}
