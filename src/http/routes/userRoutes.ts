import { FastifyInstance } from 'fastify'
import { UserRegisterController } from '../controllers/user-register-controller'

export async function userRoutes(app: FastifyInstance) {
  const userRegisterController = new UserRegisterController(userService)
  app.post('/', (request, reply) => userRegisterController.register(request, reply))
}
