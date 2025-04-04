import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'

describe('Register Gym (E2E)', () => {
  let token: string // Declare token variable

  beforeAll(async () => {
    await app.ready()

    // Create and authenticate a user specifically for this suite
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

  it('should be able to register a gym', async () => {
    // Use the token obtained in beforeAll
    // const { token } = await createAndAuthenticateUser(app) // Remove helper call

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`) // Assuming auth is required
      .send({
        title: 'JavaScript Gym',
        description: 'Some description.',
        phone: '(11) 98888-7777', // Valid format
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    expect(response.statusCode).toEqual(201)
  })
})
