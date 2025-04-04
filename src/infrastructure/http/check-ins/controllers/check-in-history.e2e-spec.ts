import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e'

describe('Check-in History (E2E)', () => {
  let token: string
  let userId: string | undefined

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
    userId = (
      await prismaTestClient.user.findUnique({
        where: { email },
        select: { id: true },
      })
    )?.id
    if (!userId) {
      throw new Error('User ID not found after user creation.')
    }
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
      data: {
        title: 'History Test Gym',
        description: null,
        phone: null,
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    // Create some check-ins for the user
    await prismaTestClient.checkIn.createMany({
      data: [
        {
          gymId: gym.id,
          userId: userId!,
        },
        {
          gymId: gym.id,
          userId: userId!,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toHaveLength(2)
    // Check structure based on CheckInPresenter output
    expect(response.body).toEqual([
      expect.objectContaining({ gymId: gym.id, userId }),
      expect.objectContaining({ gymId: gym.id, userId }),
    ])
  })

  it('should be able to list paginated check-in history', async () => {
    // Use token and userId from beforeAll
    const gym = await prismaTestClient.gym.create({
      data: { title: 'Paginated History Gym', latitude: 0, longitude: 0 },
    })

    // Create 22 check-ins
    for (let i = 1; i <= 22; i++) {
      await prismaTestClient.checkIn.create({
        data: { gymId: gym.id, userId: userId! },
      })
    }

    const response = await request(app.server)
      .get('/check-ins/history')
      .query({ page: 2 }) // Request page 2
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toHaveLength(2)
  })
})
