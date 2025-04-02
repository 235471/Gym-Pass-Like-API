import 'reflect-metadata'
import fastify from 'fastify'
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import { env } from '@/env'
import { swaggerConfig, swaggerUiConfig } from './infrastructure/config/swagger'
import { userRoutes } from './infrastructure/http/users/routes/user-routes'
import './infrastructure/container/container'

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

// Configure JWT
app.register(fastifyJwt, {
  secret: {
    private: Buffer.from(env.JWT_PRIVATE_KEY, 'base64'),
    public: Buffer.from(env.JWT_PUBLIC_KEY, 'base64'),
  },
  sign: {
    algorithm: 'RS256',
  },
})

app.get('/', () => {
  return 'Gympass like API with SOLID principles'
})

// Register routes
app.register(userRoutes, {
  prefix: 'users',
})

export { app }
