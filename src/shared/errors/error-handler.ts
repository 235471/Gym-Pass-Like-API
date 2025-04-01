import { FastifyReply } from 'fastify'
import { IError } from './interfaces/error'
import { ValidationError } from './validation-error'
import { formatValidationErrorsForHTTP } from '@/shared/utils/error-formatter'
import { ValidationErrors } from './validation-errors'
import { env } from '@/env'

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
    BadRequestError: {
      status: 400,
      message: 'Bad request',
    },
    InvalidCredentialsError: {
      status: 401,
      message: 'Invalid credentials',
    },
    ForbiddenError: {
      status: 403,
      message: 'Forbidden',
    },
    NotFoundError: {
      status: 404,
      message: 'Resource not found',
    },
    ConflictError: {
      status: 409,
      message: 'Resource already exists',
    },
    UnprocessableEntityError: {
      status: 422,
      message: 'Unprocessable Entity',
    },
    TooManyRequestsError: {
      status: 429,
      message: 'Too Many Requests',
    },
    InternalServerError: {
      status: 500,
      message: 'Internal Server Error',
    },
  }

  const errorName = error.constructor.name
  const errorInfo = errorMap[errorName] || {
    status: 500,
    message: 'Internal Server Error',
  }

  if (errorInfo.status === 500 && env.NODE_ENV !== 'production') {
    // Log the error stack trace in development mode
    console.error('Error stack trace:')
    console.error(error.stack || 'No stack trace available')
    console.error('Error name:', errorName)
    console.error('Error message:', error.message)
    console.error('Error object:', error)
  }

  return reply.status(errorInfo.status).send({
    statusCode: errorInfo.status,
    error: errorName,
    message: error.message || errorInfo.message,
  })
}
