import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e'

/**
 * Utility to create and authenticate a user in E2E tests.
 * Returns the access token and user ID. Refresh token is set in cookie.
 *
 * @param app Fastify instance
 * @returns An object containing the access token and user ID
 */
export async function createAndAuthenticateE2EUser(
  app: FastifyInstance,
): Promise<{ accessToken: string; userId: string }> {
  // Return only accessToken and userId
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

  // Extract only access token from the response body
  const { accessToken } = authResponse.body
  // Refresh token is now in the Set-Cookie header, not returned here

  // Obtain the registered user ID
  const user = await prismaTestClient.user.findUniqueOrThrow({
    where: { email },
  })

  // Return only access token and user ID
  return { accessToken, userId: user.id }
}
