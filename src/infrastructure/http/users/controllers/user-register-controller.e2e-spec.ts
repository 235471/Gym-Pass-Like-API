import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'

describe('User Register (E2E)', () => {
  beforeAll(async () => {
    // Ensure the app is ready, potentially waiting for plugins
    await app.ready()
  })

  afterAll(async () => {
    // Close the app connection
    await app.close()
  })

  it('should be able to register a new user', async () => {
    const response = await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'ValidP@ssw0rd', // Use a password that meets the schema criteria
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should not be able to register with duplicate email', async () => {
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd' // Use a password that meets the schema criteria

    // First registration
    await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email,
      password,
    })

    // Attempt second registration with the same email
    const response = await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email, // Same email
      password,
    })

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        error: 'ConflictError', // Match the actual error name
        message: expect.stringContaining('is already in use'), // Check for the static part of the message
      }),
    )
  })
})
