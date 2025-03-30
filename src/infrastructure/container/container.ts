import { container } from 'tsyringe'
import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'
import { AuthenticateUseCase } from '@/application/users/use-cases/authenticate'
import { GetUserProfileUseCase } from '@/application/users/use-cases/get-user-profile'
import { CheckInUseCase } from '@/application/users/use-cases/check-in'
import { AuthenticateController } from '../http/users/controllers/authenticate-controller'
import { UserRegisterController } from '../http/users/controllers/user-register-controller'
import { PrismaUserRepository } from '../repositories/prisma-users-repository'

// Registering Repositories
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)

// Registering Use Cases
container.registerSingleton(RegisterUserUseCase.name, RegisterUserUseCase)
container.registerSingleton(AuthenticateUseCase.name, AuthenticateUseCase)
container.registerSingleton(GetUserProfileUseCase.name, GetUserProfileUseCase)
container.registerSingleton(CheckInUseCase.name, CheckInUseCase)

// Registering Controllers
container.registerSingleton(UserRegisterController.name, UserRegisterController)
container.registerSingleton(AuthenticateController.name, AuthenticateController)
