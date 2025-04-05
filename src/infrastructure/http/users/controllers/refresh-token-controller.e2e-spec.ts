import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'

describe('Refresh Token Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to refresh tokens using cookie', async () => {
    // Arrange: Create and authenticate user manually
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd'

    // Use an agent to persist cookies between requests
    const agent = request.agent(app.server)

    await agent.post('/users').send({
      // Use agent
      name: faker.person.fullName(),
      email,
      password,
    })

    const authResponse = await agent.post('/users/auth').send({
      // Use agent
      email,
      password,
    })

    // Extract access token to send in header
    const { accessToken } = authResponse.body

    // Agent automatically stores cookies from authResponse's Set-Cookie header

    // Act: Send the refresh request using the agent (cookies are sent automatically)
    // Also send the Authorization header
    const refreshResponse = await agent
      .post('/users/refresh')
      .set('Authorization', `Bearer ${accessToken}`)

    // Assert: Check for successful refresh
    expect(refreshResponse.statusCode).toEqual(200)
    expect(refreshResponse.body).toHaveProperty('accessToken')
    expect(refreshResponse.body).not.toHaveProperty('refreshToken') // No refresh token in body

    // Assert: Check for a *new* Set-Cookie header for the rotated refresh token
    const newCookies = refreshResponse.get('Set-Cookie')
    expect(newCookies).toBeDefined() // Ensure Set-Cookie header exists on refresh response
    const newRefreshTokenCookie = newCookies?.find((cookie) =>
      cookie.startsWith('refreshToken='),
    )
    expect(newRefreshTokenCookie).toBeDefined() // Ensure new refreshToken cookie exists
    // We can't easily compare the new cookie to the old one with agent,
    // but we know a new one should be set.

    expect(refreshResponse.body.accessToken).toMatch(
      /^eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/, // Basic JWT format check
    )
  })

  it('should not be able to refresh without a refresh token cookie', async () => {
    // Arrange: No cookie is sent

    // Act: Send the refresh request without any cookie
    const refreshResponse = await request(app.server).post('/users/refresh')

    // Assert: Check for unauthorized error
    expect(refreshResponse.statusCode).toEqual(401)
    expect(refreshResponse.body).toEqual(
      expect.objectContaining({
        error: 'InvalidCredentialsError',
      }),
    )
  })

  it('should not be able to refresh with an invalid refresh token cookie', async () => {
    // Arrange: Send an invalid cookie

    // Act: Send the refresh request with a bad cookie
    const refreshResponse = await request(app.server)
      .post('/users/refresh')
      .set('Cookie', 'refreshToken=invalid-token-value')

    // Assert: Check for unauthorized error
    expect(refreshResponse.statusCode).toEqual(401)
    expect(refreshResponse.body).toEqual(
      expect.objectContaining({
        error: 'InvalidCredentialsError',
      }),
    )
  })
})
