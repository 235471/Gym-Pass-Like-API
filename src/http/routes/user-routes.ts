import { FastifyInstance } from 'fastify'
import { makeUserController } from '../controllers/factories/makeUserController'

export async function userRoutes(app: FastifyInstance) {
  const userController = makeUserController()

  app.post('/', (request, reply) => userController.register(request, reply))
}
