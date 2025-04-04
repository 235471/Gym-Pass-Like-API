import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'

describe('Profile Controller (E2E)', async () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get a authenticated user profile by id', async () => {
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

    const response = await request(app.server)
      .get('/users/me')
      .set('Authorization', `Bearer ${authResponse.body.accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
        }),
      }),
    )
  })
})
