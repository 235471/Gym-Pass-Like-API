import request from 'supertest'
import { app } from '@/app'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGymRequest } from '@/shared/test/factories/make-gym'

describe('Register Gym (E2E)', () => {
  let token: string // Declare token variable

  beforeAll(async () => {
    await app.ready()

    // Authenticate the user
    const { accessToken } = await createAndAuthenticateE2EUser(app)
    token = accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register a gym', async () => {
    const gymRequestData = MakeGymRequest()

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymRequestData)

    expect(response.statusCode).toEqual(201)
  })
})
