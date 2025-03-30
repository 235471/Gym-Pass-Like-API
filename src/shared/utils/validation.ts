import { z } from 'zod'
import { Either, left, right } from './either'
import { ValidationErrors } from '../errors/validation-errors'
import { formatValidationErrors } from './error-formatter'

export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): Either<ValidationErrors, z.infer<T>> {
  const validationResult = schema.safeParse(data)
  if (!validationResult.success) {
    const errors = formatValidationErrors(validationResult.error)
    return left(new ValidationErrors(errors))
  }
  return right(validationResult.data)
}
