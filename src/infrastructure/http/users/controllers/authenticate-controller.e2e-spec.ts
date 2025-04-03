import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'

describe('Authenticate Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate a user', async () => {
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

    expect(authResponse.statusCode).toEqual(200)
    expect(authResponse.body).toHaveProperty('accessToken')
    // Check if token format is a valid JWT
    expect(authResponse.body.accessToken).toMatch(
      /^eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/,
    )
  })

  it('should not be able to authenticate a user with invalid credentials', async () => {
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd'

    await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email,
      password,
    })

    const authResponsePasswordInvalid = await request(app.server)
      .post('/users/auth')
      .send({
        email,
        password: 'InvalidPassword',
      })

    expect(authResponsePasswordInvalid.statusCode).toEqual(401)

    const authResponseEmailInvalid = await request(app.server)
      .post('/users/auth')
      .send({
        email: 'teste@teste.com',
        password,
      })

    expect(authResponseEmailInvalid.statusCode).toEqual(401)
  })
})
