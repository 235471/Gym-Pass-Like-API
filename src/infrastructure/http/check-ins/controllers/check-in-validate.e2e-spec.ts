import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { prisma } from '@/infrastructure/database/prisma'

describe('Validate Check-in (E2E)', () => {
  let token: string
  let userId: string

  beforeAll(async () => {
    await app.ready()
    // Create and authenticate user within beforeAll
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd'
    await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email,
      password,
    })
    const authResponse = await request(app.server).post('/users/auth').send({
      email,
      password,
    })
    token = authResponse.body.accessToken // Correct property name
    // Find the created user to get their ID
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    userId = user.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to validate a check-in', async () => {
    // Use token and userId from beforeAll
    const gym = await prisma.gym.create({
      data: { title: 'Validate Test Gym', latitude: 0, longitude: 0 },
    })

    // Create a check-in for the user
    let checkIn = await prisma.checkIn.create({
      data: {
        gymId: gym.id,
        userId, // Use userId from beforeAll
      },
    })

    const response = await request(app.server)
      .patch(`/check-ins/${checkIn.id}/validate`) // Use PATCH and correct route
      .set('Authorization', `Bearer ${token}`) // Assuming auth is needed
      .send()

    expect(response.statusCode).toEqual(204) // Expect No Content

    // Verify in the database
    checkIn = await prisma.checkIn.findUniqueOrThrow({
      where: { id: checkIn.id },
    })
    expect(checkIn.validateAt).toEqual(expect.any(Date)) // Check if validateAt is set
  })

  // Optional: Add a test for validating too late (expect 422)
  // Optional: Add a test for validating non-existent check-in (expect 404)
})
