import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'node:crypto'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGym } from '@/shared/test/factories/make-gym'

describe('Validate Check-in (E2E)', () => {
  let token: string
  let userId: string

  beforeAll(async () => {
    await app.ready()

    // Authenticate the user
    const { accessToken, userId: authenticatedUserId } =
      await createAndAuthenticateE2EUser(app, true)
    token = accessToken
    userId = authenticatedUserId
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
    const gymPayload = MakeGym({
      latitude: new Decimal(-27.2092052),
      longitude: new Decimal(-49.6401091),
    })

    const gym = await prismaTestClient.gym.create({
      data: gymPayload,
    })

    // 2. Create check-in directly for the authenticated user
    let checkIn = await prismaTestClient.checkIn.create({
      data: {
        gymId: gym.id,
        userId,
      },
    })

    // 3. Validate the check-in via API
    const validateResponse = await request(app.server)
      .patch(`/check-ins/${checkIn.id}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(validateResponse.statusCode).toEqual(204)

    // 4. Check if the check-in was validated directly in the DB
    checkIn = await prismaTestClient.checkIn.findUniqueOrThrow({
      where: { id: checkIn.id },
    })

    expect(checkIn.validateAt).toEqual(expect.any(Date))
  })
})
