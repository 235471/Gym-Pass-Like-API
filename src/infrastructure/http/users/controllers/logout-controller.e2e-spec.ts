import request from 'supertest';
import { app } from '@/app';
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth';
import { prismaTestClient } from '@/shared/test/setup-e2e';

describe('Logout Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to logout and invalidate refresh tokens', async () => {
    // Arrange: Create and authenticate a user
    const { accessToken, refreshToken, userId } = await createAndAuthenticateE2EUser(app);

    // Verify token exists initially
    const initialToken = await prismaTestClient.refreshToken.findUnique({
        where: { token: refreshToken }
    });
    expect(initialToken).not.toBeNull();
    expect(initialToken?.userId).toBe(userId);

    // Act: Call the logout endpoint
    const logoutResponse = await request(app.server)
      .post('/users/logout')
      .set('Authorization', `Bearer ${accessToken}`); // Requires valid access token

    // Assert: Check for successful logout response
    expect(logoutResponse.statusCode).toEqual(204); // No Content

    // Assert: Verify the refresh token was deleted from the database
    const deletedToken = await prismaTestClient.refreshToken.findUnique({
        where: { token: refreshToken }
    });
    expect(deletedToken).toBeNull();

    // Assert: Attempting to refresh with the old token should now fail
    const refreshResponse = await request(app.server)
      .post('/users/refresh')
      .send({ refreshToken });
    expect(refreshResponse.statusCode).toEqual(401); // Unauthorized / Invalid Token
  });

  it('should return 401 if trying to logout without a valid access token', async () => {
     // Arrange: No valid token provided

     // Act: Call the logout endpoint without Authorization header
     const logoutResponse = await request(app.server).post('/users/logout');

     // Assert: Check for unauthorized error
     expect(logoutResponse.statusCode).toEqual(401);
  });
});
