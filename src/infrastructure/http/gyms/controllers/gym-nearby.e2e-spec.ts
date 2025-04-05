import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { Decimal } from '@prisma/client/runtime/library'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGym } from '@/shared/test/factories/make-gym'

describe('Nearby Gyms (E2E)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    // Authenticate the user
    const { accessToken } = await createAndAuthenticateE2EUser(app)
    token = accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list nearby gyms', async () => {
    // Use token from beforeAll

    const userLatitude = -27.2092052
    const userLongitude = -49.6401091

    // Same coordinates as the user's location
    const nearByGym = MakeGym({
      title: 'Near Gym',
      latitude: new Decimal(userLatitude),
      longitude: new Decimal(userLongitude),
    })

    // Create gyms directly using prismaTestClient
    await prismaTestClient.gym.create({
      data: nearByGym,
    })

    // Far away coordinates
    const farAwayGym = MakeGym({
      title: 'Far Gym',
      latitude: new Decimal(-27.0610928),
      longitude: new Decimal(-49.5229501),
    })

    await prismaTestClient.gym.create({
      data: farAwayGym,
    })

    // Search for gyms near the first gym's location (API Call)
    const response = await request(app.server)
      .get('/gyms/nearby')
      .query({
        latitude: userLatitude,
        longitude: userLongitude,
      })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.gyms).toBeInstanceOf(Array)
    expect(response.body.gyms).toHaveLength(1)
    expect(response.body.gyms).toEqual([
      expect.objectContaining({ title: 'Near Gym' }),
    ])
  })
})
