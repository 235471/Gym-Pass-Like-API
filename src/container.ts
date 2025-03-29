import { container } from 'tsyringe'
import { IUserRepository } from './repositories/interfaces/IUserRepository'
import { PrismaUserRepository } from './repositories/prisma-user-repository'
import { IUserService } from './services/interfaces/IUserService'
import { UserService } from './services/user-service'
import { UserRegisterController } from './http/controllers/user-register-controller'

// Registrando as dependências
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)
container.registerSingleton<IUserService>('UserService', UserService)
container.registerSingleton('UserRegisterController', UserRegisterController)
