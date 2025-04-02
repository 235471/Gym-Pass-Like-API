import { FastifyRequest, FastifyReply } from 'fastify'
import { handleError } from '@/shared/errors/error-handler'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return handleError(new InvalidCredentialsError('Unauthorized'), reply)
  }
}
