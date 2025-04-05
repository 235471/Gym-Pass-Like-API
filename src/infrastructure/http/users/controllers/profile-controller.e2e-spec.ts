import request from 'supertest'
import { app } from '@/app'
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'

describe('Profile Controller (E2E)', async () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get a authenticated user profile by id', async () => {
    // Authenticate the user
    const { accessToken } = await createAndAuthenticateE2EUser(app)

    const response = await request(app.server)
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)

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
