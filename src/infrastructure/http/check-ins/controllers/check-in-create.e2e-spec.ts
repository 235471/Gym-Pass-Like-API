import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { prisma } from '@/infrastructure/database/prisma'

describe('Create Check-in (E2E)', () => {
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
    token = authResponse.body.accessToken // Correct property name
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    // Use token from beforeAll

    // Create a gym first using Prisma directly for simplicity in test setup
    const gym = await prisma.gym.create({
      data: {
        title: 'Check-in Test Gym',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`) // Use the correct route
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052, // User is at the gym
        userLongitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(201)
  })

  it('should not be able to create two check-ins on the same day', async () => {
    // Use token from beforeAll

    const gym = await prisma.gym.create({
      data: {
        title: 'Duplicate Check-in Test Gym',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    // First check-in
    await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    // Attempt second check-in on the same day
    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(409) // Expect Conflict
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'ConflictError',
        message: 'User has already checked in today.',
      }),
    )
  })
})
