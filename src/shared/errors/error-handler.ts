import { FastifyReply } from 'fastify'
import { IError } from './interfaces/error'
import { ValidationError } from './valdiation-error'
import { formatValidationErrorsForHTTP } from '@/shared/utils/error-formatter'
import { ValidationErrors } from './validation-errors'

type ErrorMap = {
  status: number
  message: string
}

export function handleError(error: IError, reply: FastifyReply): FastifyReply {
  // Handle individual ValidationError
  if (error instanceof ValidationError) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: formatValidationErrorsForHTTP([error]),
    })
  }

  // Handle multiple ValidationErrors
  if (error instanceof ValidationErrors) {
    return reply.status(400).send({
      error: 'ValidationError',
      message: formatValidationErrorsForHTTP(error.errors),
    })
  }

  const errorMap: Record<string, ErrorMap> = {
    ConflictError: {
      status: 409,
      message: 'Resource already exists',
    },
    UnauthorizedError: {
      status: 401,
      message: 'Unauthorized',
    },
    ForbiddenError: {
      status: 403,
      message: 'Forbidden',
    },
    NotFoundError: {
      status: 404,
      message: 'Resource not found',
    },
    BadRequestError: {
      status: 400,
      message: 'Bad request',
    },
  }

  const errorName = error.constructor.name
  const errorInfo = errorMap[errorName] || {
    status: 500,
    message: 'Internal Server Error',
  }

  return reply.status(errorInfo.status).send({
    statusCode: errorInfo.status,
    error: errorName,
    message: error.message || errorInfo.message,
  })
}
