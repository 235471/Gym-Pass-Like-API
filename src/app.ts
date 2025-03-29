import 'reflect-metadata'
import fastify from 'fastify'
import { userRoutes } from './http/routes/user-routes'
import './container'

const app = fastify()

app.get('/', () => {
  return 'Gympass like API with SOLID principles'
})

app.register(userRoutes, {
  prefix: 'users',
})

export { app }
