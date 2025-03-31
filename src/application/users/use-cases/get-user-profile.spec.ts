import { InMemoryUsersRepository } from '@/domains/users/repository/in-memory/in-memory-user-repository'
import { makeUser } from '@/shared/test/factories/make-user'
import { GetUserProfileUseCase } from './get-user-profile'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@/shared/errors/not-found-error' // Added import

describe('Get User Profile Use Case test suite', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let sut: GetUserProfileUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(inMemoryUsersRepository)
  })

  it('should be able to get user profile', async () => {
    // Arrange: Create a user directly in the repository
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6) // Hash it

    // Create user in repo
    const userRegister = await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash, // Store the hash
    })

    // Check if creation was successful (Right side of Either)
    expect(userRegister.isRight()).toBeTruthy() // Add assertion for creation success
    if (userRegister.isRight()) {
      const createdUser = userRegister.value // Get the created user object from repo

      // Act: Attempt to get profile using the ID from the created user
      const result = await sut.execute({
        userId: createdUser.id, // Use the actual ID
      })

      // Assert: Check for successful profile retrieval
      expect(result.isRight()).toBeTruthy()
      if (result.isRight()) {
        const userProfile = result.value
        expect(userProfile.id).toBe(createdUser.id)
        expect(userProfile.email).toBe(userData.email) // Compare with original data
        expect(userProfile.name).toBe(userData.name) // Compare with original data
      }
    }
  })

  it('should not be able to get user profile with wrong id', async () => {
    // Arrange: Create a user first to ensure the repository isn't empty
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6)
    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    // Act: Attempt to get profile with a completely random, non-existent ID
    const result = await sut.execute({
      userId: randomUUID(), // Use a guaranteed non-existent ID
    })

    // Assert: Check for failure (Left side of Either)
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(NotFoundError) // Check specific error type
      expect(error.message).toBe('Resource not found') // Check error message
    }
  })
})
