import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'
import { prisma } from '@/infrastructure/database/prisma'

describe('Check-in History (E2E)', () => {
  let token: string
  let userId: string

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
    // Find the created user to get their ID
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    userId = user.id
  })

  afterAll(async () => {
    await app.close()
  })

  it("should be able to list the user's check-in history", async () => {
    // Use token and userId from beforeAll

    const gym = await prisma.gym.create({
      data: {
        title: 'History Test Gym',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    // Create some check-ins for the user
    await prisma.checkIn.createMany({
      data: [
        {
          gymId: gym.id,
          userId, // Use userId from beforeAll
        },
        {
          gymId: gym.id,
          userId, // Use userId from beforeAll
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
    const gym = await prisma.gym.create({
      data: { title: 'Paginated History Gym', latitude: 0, longitude: 0 },
    })

    // Create 22 check-ins
    for (let i = 1; i <= 22; i++) {
      await prisma.checkIn.create({
        data: { gymId: gym.id, userId }, // Use userId from beforeAll
      })
    }

    const response = await request(app.server)
      .get('/check-ins/history')
      .query({ page: 2 }) // Request page 2
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toHaveLength(2) // Expecting the last 2 check-ins
  })
})
