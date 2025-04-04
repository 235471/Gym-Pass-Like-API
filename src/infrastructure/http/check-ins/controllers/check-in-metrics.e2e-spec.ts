import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'
import { prisma } from '@/infrastructure/database/prisma'

describe('Check-in Metrics (E2E)', () => {
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

  it("should be able to get the total count of user's check-ins", async () => {
    // Use token and userId from beforeAll
    const gym = await prisma.gym.create({
      data: { title: 'Metrics Test Gym', latitude: 0, longitude: 0 },
    })

    // Create some check-ins for the user
    await prisma.checkIn.createMany({
      data: [
        { gymId: gym.id, userId }, // Use userId from beforeAll
        { gymId: gym.id, userId }, // Use userId from beforeAll
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    // Controller returns the count directly as the body
    expect(response.body).toEqual(2)
  })
})
