import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'
import { PrismaUserRepository } from '@/infrastructure/repositories/users/prisma-user-repository'

export function makeRegisterUserUseCase() {
  const userRepository = new PrismaUserRepository()
  const registerUserUseCase = new RegisterUserUseCase(userRepository)

  return registerUserUseCase
}
