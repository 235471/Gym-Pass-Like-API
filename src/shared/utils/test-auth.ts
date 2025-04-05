import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e'

/**
 * Utility to create and authenticate a user in E2E tests
 *
 * @param app Fastify instance
 * @returns An object containing the access token and user ID
 */
export async function createAndAuthenticateE2EUser(
  app: FastifyInstance,
): Promise<{ accessToken: string; userId: string }> {
  const name = faker.person.fullName()
  const email = faker.internet.email()
  const password = 'ValidP@ssw0rd'

  // Register the user via HTTP request
  await request(app.server).post('/users').send({
    name,
    email,
    password,
  })

  // Authenticate the user
  const authResponse = await request(app.server).post('/users/auth').send({
    email,
    password,
  })

  const { accessToken } = authResponse.body

  // Obtain the registered user ID
  const user = await prismaTestClient.user.findUniqueOrThrow({
    where: { email },
  })

  return { accessToken, userId: user.id }
}
