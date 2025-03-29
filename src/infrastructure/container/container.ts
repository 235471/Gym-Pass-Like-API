import { container } from 'tsyringe'
import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { PrismaUserRepository } from '@/infrastructure/repositories/users/prisma-user-repository'
import { UserRegisterController } from '@/infrastructure/controllers/users/user-register-controller'
import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'

// Registering Repositories
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)

// Registering Use Cases
container.registerSingleton(RegisterUserUseCase.name, RegisterUserUseCase)

// Registering Controllers
container.registerSingleton(UserRegisterController.name, UserRegisterController)
