import 'reflect-metadata'
import fastify from 'fastify'
import { userRoutes } from './http/routes/user-routes'
import './container'
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { swaggerConfig, swaggerUiConfig } from './config/swagger'

// Create fastify instance with Zod type provider
const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configure Zod compilers
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configure Swagger
app.register(fastifySwagger, {
  ...swaggerConfig,
  transform: jsonSchemaTransform,
})

// Configure Swagger UI
app.register(fastifySwaggerUi, swaggerUiConfig)

app.get('/', () => {
  return 'Gympass like API with SOLID principles'
})

// Register routes
app.register(userRoutes, {
  prefix: 'users',
})

export { app }
