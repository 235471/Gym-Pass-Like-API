import { InMemoryUsersRepository } from '../../../domains/users/repository/in-memory/in-memory-user-repository'
import { RegisterUserUseCase } from './register-user'
import { compare } from 'bcryptjs'
import { makeUser } from '@/shared/test/factories/make-user'

describe('Register Use Case test suite', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let sut: RegisterUserUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new RegisterUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to register an user', async () => {
    // Act - Execute use case
    const registerData = makeUser()

    const result = await sut.execute(registerData)

    // Assert - Verificar o resultado
    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const userData = result.value
      expect(userData.id).toBeDefined()
      expect(userData.email).toBe(registerData.email)
      expect(userData.name).toBe(registerData.name)
      expect(userData.password).toEqual(expect.any(String))
    }
  })

  it('should be able to hash password when registering a user', async () => {
    // Act - Execute use case
    const registerData = makeUser()

    const result = await sut.execute(registerData)

    // Assert - Verificar o resultado
    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const userData = result.value
      // Check for hashed password
      expect(userData.password).toBeDefined()
      expect(userData.password).not.toBe(registerData.password)
      expect(userData.password).toMatch(/^\$2[ab]\$\d+\$/)

      const isProperlyHashed = await compare(
        registerData.password,
        userData.password,
      )

      expect(isProperlyHashed).toBeTruthy()
    }
  })

  it('should not be possible to register with a previsouly registered email', async () => {
    let result
    const specificEmail = 'test.duplicate@example.com'
    const registerData = makeUser({ email: specificEmail })

    // Act - Execute use case (primeira tentativa com email específico)
    result = await sut.execute(registerData)

    // Assert - Verificar o resultado da primeira tentativa
    expect(result.isRight()).toBeTruthy()

    // Segunda tentativa com o mesmo email
    result = await sut.execute({
      name: 'Other User',
      email: specificEmail,
      password: 'anotherPassword123!',
    })

    expect(result.isLeft()).toBeTruthy()

    if (result.isLeft()) {
      const error = result.value
      expect(error.message).toBe(`Email '${specificEmail}' is already in use`)
      expect(error.name).toBe('ConflictError')
    }
  })
})
