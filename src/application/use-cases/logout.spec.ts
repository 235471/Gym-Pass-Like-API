import { InMemoryRefreshTokenRepository } from '@/domains/users/repository/in-memory/in-memory-refresh-token-repository';
import { LogoutUseCase } from './logout';

describe('Logout Use Case Test Suite', () => {
  let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository;
  let sut: LogoutUseCase;

  beforeEach(() => {
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new LogoutUseCase(inMemoryRefreshTokenRepository);
  });

  it('should delete all refresh tokens for a given user ID', async () => {
    // Arrange
    const targetUserId = 'user-123';
    const otherUserId = 'user-456';
    await inMemoryRefreshTokenRepository.create({ userId: targetUserId, token: 'token1', expiresAt: new Date(Date.now() + 100000) });
    await inMemoryRefreshTokenRepository.create({ userId: targetUserId, token: 'token2', expiresAt: new Date(Date.now() + 100000) });
    await inMemoryRefreshTokenRepository.create({ userId: otherUserId, token: 'token3', expiresAt: new Date(Date.now() + 100000) });
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(3);

    // Act
    const result = await sut.execute({ userId: targetUserId });

    // Assert
    expect(result.isRight()).toBeTruthy();
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(1);
    expect(inMemoryRefreshTokenRepository.items[0].userId).toBe(otherUserId);
    expect(inMemoryRefreshTokenRepository.items[0].token).toBe('token3');
  });

  it('should succeed even if the user has no refresh tokens to delete', async () => {
    // Arrange
    const userIdWithNoTokens = 'user-789';
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0);

    // Act
    const result = await sut.execute({ userId: userIdWithNoTokens });

    // Assert
    expect(result.isRight()).toBeTruthy();
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0);
  });
});
