import { InMemoryUsersRepository } from '@/domains/users/repositories/in-memory/in-memory-user-repository'
import { makeUser } from '@/shared/test/factories/make-user'
import { GetUserProfileUseCase } from './get-user-profile'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'

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
    const passwordHash = await hash(userData.password, 6) // Use bcryptjs to hash the password

    const userRegister = await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })

    if (userRegister.isRight()) {
      const user = userRegister.value
      // Act: Attempt to get profile
      const result = await sut.execute({
        userId: user.id,
      })

      // Assert: Check for successful profile retrieval
      expect(result.isRight()).toBeTruthy()
      if (result.isRight()) {
        const userProfile = result.value
        expect(userProfile.id).toBe(user.id)
        expect(userProfile.email).toBe(user.email)
        expect(userProfile.name).toBe(user.name)
        expect(userProfile.password).toBe(user.passwordHash)
        expect(userProfile).not.toHaveProperty('passwordHash')
      }
    }
  })
  it('should not be able to get user profile with wrong id', async () => {
    // Arrange: Create a user directly in the repository
    const userData = makeUser()
    const passwordHash = await hash(userData.password, 6) // Use bcryptjs to hash the password

    await inMemoryUsersRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
    })
    // Act: Attempt to get profile with invalid id
    const result = await sut.execute({
      userId: randomUUID(),
    })

    // Assert: Check for successful profile retrieval
    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error.message).toBe('Resource not found')
      expect(error.name).toBe('NotFoundError')
    }
  })
})
