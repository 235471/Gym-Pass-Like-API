import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'
import { prismaTestClient } from '@/shared/test/setup-e2e'

describe('Logout Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to logout and invalidate refresh tokens', async () => {
    // Arrange: Create and authenticate user manually to get tokens/cookie
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
    const { accessToken } = authResponse.body
    const cookies = authResponse.get('Set-Cookie')
    const refreshTokenCookie = cookies?.find((cookie) =>
      cookie.startsWith('refreshToken='),
    )
    expect(refreshTokenCookie).toBeDefined()
    const refreshTokenValue = refreshTokenCookie!.split(';')[0].split('=')[1]

    // Verify token exists initially in DB
    const initialToken = await prismaTestClient.refreshToken.findUnique({
      where: { token: refreshTokenValue },
    })
    expect(initialToken).not.toBeNull()

    // Act: Call the logout endpoint with access token and refresh token cookie
    const logoutResponse = await request(app.server)
      .post('/users/logout')
      .set('Cookie', refreshTokenCookie!) // Send cookie back (though not strictly needed for logout logic)
      .set('Authorization', `Bearer ${accessToken}`)

    // Assert: Check for successful logout response
    expect(logoutResponse.statusCode).toEqual(204)

    // Assert: Check Set-Cookie header clears the cookie
    const logoutCookies = logoutResponse.get('Set-Cookie')
    expect(logoutCookies).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=;')]), // Check for empty value
    )
    expect(logoutCookies).toEqual(
      expect.arrayContaining([expect.stringContaining('Max-Age=0')]), // Check for expiry
    )

    // Assert: Verify the refresh token was deleted from the database
    const deletedToken = await prismaTestClient.refreshToken.findUnique({
      where: { token: refreshTokenValue },
    })
    expect(deletedToken).toBeNull()

    // Assert: Attempting to refresh with the old cookie should now fail
    const refreshResponse = await request(app.server)
      .post('/users/refresh')
      .set('Cookie', refreshTokenCookie!)
    expect(refreshResponse.statusCode).toEqual(401) // Unauthorized / Invalid Token
  })

  it('should return 401 if trying to logout without a valid access token', async () => {
    // Arrange: No valid token provided

    // Act: Call the logout endpoint without Authorization header
    const logoutResponse = await request(app.server).post('/users/logout')

    // Assert: Check for unauthorized error
    expect(logoutResponse.statusCode).toEqual(401)
  })
})
