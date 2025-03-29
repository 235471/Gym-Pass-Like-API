import { container } from 'tsyringe'
import { IUserRepository } from '@/domains/users/repositories/IUserRepository'
import { PrismaUserRepository } from '@/infrastructure/repositories/users/prisma-user-repository'
import { UserRegisterController } from '@/infrastructure/http/users/controllers/user-register-controller'
import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'
import { AuthenticateUseCase } from '@/application/users/use-cases/authenticate'
import { AuthenticateController } from '../http/users/controllers/authenticate-controller'

// Registering Repositories
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)

// Registering Use Cases
container.registerSingleton(RegisterUserUseCase.name, RegisterUserUseCase)
container.registerSingleton(AuthenticateUseCase.name, AuthenticateUseCase)

// Registering Controllers
container.registerSingleton(UserRegisterController.name, UserRegisterController)
container.registerSingleton(AuthenticateController.name, AuthenticateController)
