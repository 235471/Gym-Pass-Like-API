import request from 'supertest'
import { app } from '@/app'
import { prismaTestClient } from '@/shared/test/setup-e2e'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGym } from '@/shared/test/factories/make-gym'

describe('Check-in History (E2E)', () => {
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

  afterEach(async () => {
    // Clean up check-ins after each test
    await prismaTestClient.checkIn.deleteMany()
    await prismaTestClient.gym.deleteMany()
  })

  it("should be able to list the user's check-in history", async () => {
    const gym = await prismaTestClient.gym.create({
      data: MakeGym(),
    })

    // Create some check-ins for the user
    await prismaTestClient.checkIn.createMany({
      data: [
        {
          gymId: gym.id,
          userId,
        },
        {
          gymId: gym.id,
          userId,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkIns).toBeInstanceOf(Array)
    expect(response.body.checkIns).toHaveLength(2)
    // Check structure based on CheckInPresenter output
    expect(response.body.checkIns).toEqual([
      expect.objectContaining({ gymId: gym.id, userId }),
      expect.objectContaining({ gymId: gym.id, userId }),
    ])
  })

  it('should be able to list paginated check-in history', async () => {
    // Use token and userId from beforeAll
    const gym = await prismaTestClient.gym.create({
      data: MakeGym(),
    })

    // Create 22 check-ins
    for (let i = 1; i <= 22; i++) {
      await prismaTestClient.checkIn.create({
        data: { gymId: gym.id, userId },
      })
    }

    const response = await request(app.server)
      .get('/check-ins/history')
      .query({ page: 2 })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkIns).toBeInstanceOf(Array)
    expect(response.body.checkIns).toHaveLength(2)
  })
})
