import { InMemoryUsersRepository } from '@/domains/users/repository/in-memory/in-memory-user-repository'
import { InMemoryRefreshTokenRepository } from '@/domains/users/repository/in-memory/in-memory-refresh-token-repository' // Import in-memory refresh repo
import { hash } from 'bcryptjs'
import { AuthenticateUseCase } from './authenticate'
import { makeUser } from '@/shared/test/factories/make-user'
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials-error'

describe('Authenticate Use Case test suite', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let inMemoryRefreshTokenRepository: InMemoryRefreshTokenRepository // Declare refresh repo
  let sut: AuthenticateUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryRefreshTokenRepository = new InMemoryRefreshTokenRepository() // Instantiate refresh repo
    sut = new AuthenticateUseCase(
      inMemoryUsersRepository,
      inMemoryRefreshTokenRepository // Pass refresh repo to constructor
    )
  })

  it('should be able to authenticate an user and return tokens', async () => {
    // Arrange
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6)

    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    // Act
    const result = await sut.execute({
      email: userData.email,
      password: userData.password,
    })

    // Assert
    expect(result.isRight()).toBeTruthy()
    expect(inMemoryRefreshTokenRepository.items).toHaveLength(1)

    if (result.isRight()) {
      const { user, refreshToken } = result.value
      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user).not.toHaveProperty('passwordHash')

      expect(refreshToken).toEqual(expect.any(String))
      expect(inMemoryRefreshTokenRepository.items[0].token).toEqual(refreshToken)
      expect(inMemoryRefreshTokenRepository.items[0].userId).toEqual(user.id)
    }
  })

  it('should not be able to authenticate with wrong email', async () => {
    // Arrange
    const loginData = makeUser()

    // Act
    const result = await sut.execute({
      email: 'wrong.email@example.com',
      password: loginData.password,
    })

    // Assert
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(InvalidCredentialsError)
      expect(error.message).toBe('Invalid credentials')
    }
  })

  it('should not be able to authenticate with wrong password', async () => {
    // Arrange
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6)

    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    // Act
    const result = await sut.execute({
      email: userData.email,
      password: 'wrongPassword123!',
    })

    // Assert
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(InvalidCredentialsError)
      expect(error.message).toBe('Invalid credentials')
    }
  })
})
