import { InMemoryUsersRepository } from '@/domains/users/repositories/in-memory/in-memory-user-repository'
import { hash } from 'bcryptjs'
import { AuthenticateUseCase } from './authenticate'
import { makeUser } from '@/shared/test/factories/make-user'
import { UnauthorizedError } from '@/shared/errors/unauthorized-error'

describe('Authenticate Use Case test suite', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let sut: AuthenticateUseCase

  beforeAll(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(inMemoryUsersRepository)
  })

  it('should be able to authenticate an user', async () => {
    // Arrange: Create a user directly in the repository
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6) // Use bcryptjs to hash the password

    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    // Act: Attempt to authenticate
    const result = await sut.execute({
      email: userData.email,
      password: userData.password, // Use the original password for login attempt
    })

    // Assert: Check for successful authentication
    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      const authenticatedUser = result.value
      expect(authenticatedUser.id).toBeDefined()
      expect(authenticatedUser.email).toBe(userData.email)
      expect(authenticatedUser.name).toBe(userData.name)
      expect(authenticatedUser).not.toHaveProperty('passwordHash')
    }
  })

  it('should not be able to authenticate with wrong email', async () => {
    // Arrange: No user is created with this email
    const loginData = makeUser() // Use factory for login attempt data

    // Act: Attempt to authenticate
    const result = await sut.execute({
      email: 'wrong.email@example.com',
      password: loginData.password,
    })

    // Assert: Check for authentication failure (UnauthorizedError)
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(UnauthorizedError)
      expect(error.message).toBe('Invalid credentials')
    }
  })

  it('should not be able to authenticate with wrong password', async () => {
    // Arrange: Create a user
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6)

    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    // Act: Attempt to authenticate with the correct email but wrong password
    const result = await sut.execute({
      email: userData.email,
      password: 'wrongPassword123!',
    })

    // Assert: Check for authentication failure (UnauthorizedError)
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(UnauthorizedError)
      expect(error.message).toBe('Invalid credentials')
    }
  })
})
