import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs' // Import bcryptjs

describe('Validate Check-in (E2E)', () => {
  let token: string
  let userId: string // Declare userId

  beforeAll(async () => {
    await app.ready()

    // Create and authenticate user within beforeAll
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd'
    // Create user directly
    const user = await prismaTestClient.user.create({
      data: {
        name: faker.person.fullName(),
        email,
        passwordHash: await bcrypt.hash(password, 6), // Use imported bcrypt
      },
    })
    userId = user.id // Store userId

    // Authenticate user
    const authResponse = await request(app.server).post('/users/auth').send({
      email,
      password,
    })
    token = authResponse.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 when validating a nonexistent check-in', async () => {
    // Use a valid but non-existent UUID
    const nonExistentCheckInId = randomUUID()

    // Attempt to validate
    const response = await request(app.server)
      .patch(`/check-ins/${nonExistentCheckInId}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    // Check-in id doesn't exist returns 404
    expect(response.statusCode).toEqual(404)
    expect(response.body).toHaveProperty('error', 'NotFoundError')
  })

  it('should be able to validate a check-in', async () => {
    // 1. Create gym directly
    const gym = await prismaTestClient.gym.create({
      data: {
        title: 'Academia JavaScript',
        description: 'A melhor academia para devs',
        phone: '11999999999',
        latitude: new Decimal(-27.2092052),
        longitude: new Decimal(-49.6401091),
      },
    })

    // 2. Create check-in directly for the authenticated user
    let checkIn = await prismaTestClient.checkIn.create({
      data: {
        gymId: gym.id,
        userId: userId, // Use userId from beforeAll
      },
    })
    const checkInId = checkIn.id

    // 3. Validate the check-in via API
    const validateResponse = await request(app.server)
      .patch(`/check-ins/${checkInId}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(validateResponse.statusCode).toEqual(204)

    // 4. Check if the check-in was validated directly in the DB
    checkIn = await prismaTestClient.checkIn.findUniqueOrThrow({
      where: { id: checkInId },
    })

    expect(checkIn.validateAt).toEqual(expect.any(Date))
  })
})
