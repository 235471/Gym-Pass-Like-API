import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { faker } from '@faker-js/faker'
import { prisma } from '@/infrastructure/database/prisma'

// Utility function to create a user and get an authentication token + userId
export async function createAndAuthenticateUser(
  app: FastifyInstance,
  // Add optional role parameter if needed for authorization tests
  // role: 'ADMIN' | 'MEMBER' = 'MEMBER',
): Promise<{ token: string; userId: string }> {
  // Update return type
  const name = faker.person.fullName()
  const email = faker.internet.email()
  const password = 'ValidP@ssw0rd' // Use a valid password format

  // Register the user directly via HTTP request
  await request(app.server).post('/users').send({
    name,
    email,
    password,
    // Add role if your registration accepts it
    // role,
  })

  // Authenticate the user
  const authResponse = await request(app.server).post('/users/auth').send({
    email,
    password,
  })

  const { token } = authResponse.body

  // Find the created user to get their ID
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  })

  return { token, userId: user.id } // Return token and userId
}
