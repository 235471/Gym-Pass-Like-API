import { FastifyRequest, FastifyReply } from 'fastify'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'
import { handleError } from '@/shared/errors/error-handler'
export function verifyUserRole(roleToVerify: 'ADMIN' | 'USER') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user

    if (role !== roleToVerify) {
      return handleError(new InvalidCredentialsError('Not authorized'), reply)
    }
  }
}
