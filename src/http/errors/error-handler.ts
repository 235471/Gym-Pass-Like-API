import { FastifyReply } from 'fastify'
import { IError } from './interface/error'

type ErrorMap = {
  status: number
  message: string
}

export function handleError(error: IError, reply: FastifyReply): FastifyReply {
  const errorMap: Record<string, ErrorMap> = {
    ConflictError: {
      status: 409,
      message: 'Resource already exists',
    },
    // Adicione outros erros aqui
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
