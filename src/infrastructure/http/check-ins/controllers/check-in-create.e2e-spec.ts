import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e' // Import test client
import { Decimal } from '@prisma/client/runtime/library' // Import Decimal

describe('Create Check-in (E2E)', () => {
  let token: string
  let gymId: string // Keep gymId to share between tests

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
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    // Create gym directly using prismaTestClient
    const gym = await prismaTestClient.gym.create({
      data: {
        title: 'JavaScript Gym',
        description: 'Some description.',
        phone: null,
        latitude: new Decimal(-27.2092052), // Use Decimal
        longitude: new Decimal(-49.6401091), // Use Decimal
      },
    })

    gymId = gym.id // Store the gym ID for the next test

    const response = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(201)
  })

  it('should not be able to create two check-ins on the same day', async () => {
    // Assumes the first check-in was created in the previous test using the same gymId

    // Attempt second check-in on the same day
    const response = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`) // Use the stored gymId
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(429)
    expect(response.body).toEqual(
      // Expect ConflictError based on corrected use case logic
      expect.objectContaining({
        error: "TooManyRequestsError",
        message:
          "You can only check in to one gym per day. Please try again tomorrow.",
      })
    );
  })
})
