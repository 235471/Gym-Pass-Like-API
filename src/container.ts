import { container } from 'tsyringe'
import { IUserRepository } from './repositories/interfaces/IUserRepository'
import { PrismaUserRepository } from './repositories/prisma-user-repository'
import { UserRegisterController } from './http/controllers/user-register-controller'
import { RegisterUserUseCase } from './use-cases/users/register-user'
import { GetUserByEmailUseCase } from './use-cases/users/get-user-by-email'
import { GetUserByIdUseCase } from './use-cases/users/get-user-by-id'

// Registering Repositories
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)

// Registering Use Cases
container.registerSingleton(RegisterUserUseCase.name, RegisterUserUseCase)
container.registerSingleton(GetUserByEmailUseCase.name, GetUserByEmailUseCase)
container.registerSingleton(GetUserByIdUseCase.name, GetUserByIdUseCase)

// Registering Controllers
container.registerSingleton('UserRegisterController', UserRegisterController)
