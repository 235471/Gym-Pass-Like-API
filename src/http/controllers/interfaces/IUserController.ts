import { FastifyRequest, FastifyReply } from 'fastify'

export interface IUserController {
  register(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply>
  authenticate?(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply>
  profile?(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply>
}
