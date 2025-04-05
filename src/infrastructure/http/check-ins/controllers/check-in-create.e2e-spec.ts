import request from 'supertest'
import { app } from '@/app'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { Decimal } from '@prisma/client/runtime/library'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGym } from '@/shared/test/factories/make-gym'

describe('Create Check-in (E2E)', () => {
  let token: string
  let gymId: string // Keep gymId to share between tests

  beforeAll(async () => {
    await app.ready()
    // Usa a função utilitária para autenticar o usuário
    const { accessToken } = await createAndAuthenticateE2EUser(app)
    token = accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    // Create gym directly using prismaTestClient
    const createGym = MakeGym({
      latitude: new Decimal(-27.2092052),
      longitude: new Decimal(-49.6401091),
    })
    // Create gym using the factory
    const gym = await prismaTestClient.gym.create({
      data: createGym,
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
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(429)
    expect(response.body).toEqual(
      // Expect ConflictError based on corrected use case logic
      expect.objectContaining({
        error: 'TooManyRequestsError',
        message:
          'You can only check in to one gym per day. Please try again tomorrow.',
      }),
    )
  })
})
