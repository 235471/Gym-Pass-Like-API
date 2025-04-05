import { InMemoryUsersRepository } from '@/domains/users/repository/in-memory/in-memory-user-repository'
import { InMemoryRefreshTokenRepository } from '@/domains/users/repository/in-memory/in-memory-refresh-token-repository'
import { RefreshTokenUseCase } from './refresh-token'
import { AuthenticateService } from '@/application/services/authenticate-service'
import { makeUser } from '@/shared/test/factories/make-user'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { vi } from 'vitest'; // Import vi

// Mock AuthenticateService
vi.mock('@/application/services/authenticate-service', () => {
  return {
    AuthenticateService: vi.fn().mockImplementation(() => {
      return {
        generateToken: vi.fn((user) => `mock-access-token-for-${user.id}`),
      };
    }),
  };
});

describe('Refresh Token Use Case Test Suite', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository
  let authenticateService: AuthenticateService
  let sut: RefreshTokenUseCase
  let testUser: Awaited<ReturnType<typeof createTestUser>>

  async function createTestUser() {
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6)
    const userResult = await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })
    if (userResult.isLeft()) throw new Error('Failed to create test user')
    return userResult.value
  }

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository()
    authenticateService = new AuthenticateService() // Instantiate mocked service
    sut = new RefreshTokenUseCase(
      inMemoryRefreshTokenRepository,
      inMemoryUsersRepository,
      authenticateService,
    )
    testUser = await createTestUser()
  })

  it('should be able to refresh a token successfully', async () => {
    // Arrange
    const oldRefreshToken = 'valid-refresh-token'
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await inMemoryRefreshTokenRepository.create({
      userId: testUser.id,
      token: oldRefreshToken,
      expiresAt,
    })

    // Act
    const result = await sut.execute({ refreshToken: oldRefreshToken })

    // Assert
    expect(result.isRight()).toBeTruthy()
    expect(authenticateService.generateToken).toHaveBeenCalledTimes(1); // Check mock call
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(1) // Old deleted, new created

    if (result.isRight()) {
      const { accessToken, newRefreshToken } = result.value
      expect(accessToken).toBe(`mock-access-token-for-${testUser.id}`); // Check mock return value
      expect(newRefreshToken).toEqual(expect.any(String))
      expect(newRefreshToken).not.toBe(oldRefreshToken)
      const storedToken = inMemoryRefreshTokenRepository.items.find(
        (t) => t.token === newRefreshToken,
      )
      expect(storedToken).toBeDefined()
      expect(storedToken?.userId).toBe(testUser.id)
    }
  })

  it('should fail if the refresh token does not exist', async () => {
    // Arrange (no token created)

    // Act
    const result = await sut.execute({ refreshToken: 'non-existent-token' })

    // Assert
    expect(result.isLeft()).toBeTruthy()
    expect(authenticateService.generateToken).not.toHaveBeenCalled(); // Check mock call
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCredentialsError)
      expect(result.value.message).toContain('Invalid or expired refresh token')
    }
  })

  it('should fail if the refresh token is expired', async () => {
    // Arrange
    const expiredRefreshToken = 'expired-refresh-token'
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() - 1)
    await inMemoryRefreshTokenRepository.create({
      userId: testUser.id,
      token: expiredRefreshToken,
      expiresAt,
    })

    // Act
    const result = await sut.execute({ refreshToken: expiredRefreshToken })

    // Assert
    expect(result.isLeft()).toBeTruthy()
    expect(authenticateService.generateToken).not.toHaveBeenCalled(); // Check mock call
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0) // Expired token and any others for user should be deleted
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCredentialsError)
      expect(result.value.message).toContain('Invalid or expired refresh token')
    }
  })

  it('should fail if the user associated with the token does not exist', async () => {
    // Arrange
    const validRefreshToken = 'valid-token-orphan-user'
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await inMemoryRefreshTokenRepository.create({
      userId: testUser.id,
      token: validRefreshToken,
      expiresAt,
    })
    inMemoryUsersRepository.items = [] // Simulate user deletion

    // Act
    const result = await sut.execute({ refreshToken: validRefreshToken })

    // Assert
    expect(result.isLeft()).toBeTruthy()
    expect(authenticateService.generateToken).not.toHaveBeenCalled(); // Check mock call
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(0) // Orphan token should be deleted
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
      expect(result.value.message).toContain(
        'User associated with token not found',
      )
    }
  })
})
