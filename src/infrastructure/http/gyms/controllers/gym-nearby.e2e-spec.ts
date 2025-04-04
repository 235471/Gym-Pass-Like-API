import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'

describe('Nearby Gyms (E2E)', () => {
  let token: string

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
    token = authResponse.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list nearby gyms', async () => {
    // Use token from beforeAll

    const userLatitude = -27.2092052
    const userLongitude = -49.6401091

    // Create gyms at different locations
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Near Gym',
        description: 'Near gym description',
        phone: '11999999999',
        latitude: userLatitude, // User's exact location
        longitude: userLongitude,
      })

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Far Gym',
        description: 'Far gym description',
        phone: '11999999998',
        latitude: -27.0610928, // Further away
        longitude: -49.5229501,
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
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toHaveLength(1)
    expect(response.body).toEqual([
      expect.objectContaining({ title: 'Near Gym' }),
    ])
  })
})
