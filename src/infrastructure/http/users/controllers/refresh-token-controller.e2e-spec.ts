import request from 'supertest';
import { app } from '@/app';
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth';

describe('Refresh Token Controller (E2E)', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to refresh tokens', async () => {
    // Arrange: Create and authenticate a user to get initial tokens
    const { accessToken, refreshToken } = await createAndAuthenticateE2EUser(app);

    // Act: Send the refresh token to the refresh endpoint
    const refreshResponse = await request(app.server)
      .post('/users/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    // Assert: Check for successful refresh
    expect(refreshResponse.statusCode).toEqual(200);
    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.body).toHaveProperty('refreshToken');
    expect(refreshResponse.body.refreshToken).not.toEqual(refreshToken); // Ensure rotation
    expect(refreshResponse.body.accessToken).toMatch(
      /^eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/, // Basic JWT format check
    );
  });

  it('should not be able to refresh with an invalid refresh token', async () => {
    // Arrange: Use an invalid token string
    const invalidRefreshToken = 'invalid-token-string';

    // Act: Send the invalid refresh token
    const refreshResponse = await request(app.server)
      .post('/users/refresh')
      .send({ refreshToken: invalidRefreshToken });

    // Assert: Check for unauthorized error
    expect(refreshResponse.statusCode).toEqual(401);
    expect(refreshResponse.body).toEqual(
      expect.objectContaining({
        error: 'InvalidCredentialsError', // Or whatever error the use case returns
      }),
    );
  });
});
