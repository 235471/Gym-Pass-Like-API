import request from 'supertest'
import { app } from '@/app'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGym } from '@/shared/test/factories/make-gym'

describe('Check-in Metrics (E2E)', () => {
  let token: string
  let userId: string

  beforeAll(async () => {
    await app.ready()
    // Authenticate the user
    const { accessToken, userId: authenticatedUserId } =
      await createAndAuthenticateE2EUser(app)
    token = accessToken
    userId = authenticatedUserId
  })

  afterAll(async () => {
    await app.close()
  })

  it("should be able to get the total count of user's check-ins", async () => {
    const gym = await prismaTestClient.gym.create({
      data: MakeGym(),
    })

    // Create some check-ins for the user
    await prismaTestClient.checkIn.createMany({
      data: [
        { gymId: gym.id, userId },
        { gymId: gym.id, userId },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    // Controller returns the count directly as the body
    expect(response.body.checkInsCount).toEqual(2)
  })
})
