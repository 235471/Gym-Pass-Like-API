import { container } from 'tsyringe'
import { RegisterUserUseCase } from '@/application/users/use-cases/register-user'
import { AuthenticateUseCase } from '@/application/users/use-cases/authenticate'
import { GetUserProfileUseCase } from '@/application/users/use-cases/get-user-profile'
import { CheckInUseCase } from '@/application/users/use-cases/check-in'
import { CreateGymUseCase } from '@/application/users/use-cases/create-gym'
import { SearchGymUseCase } from '@/application/users/use-cases/search-gym'
import { FetchNearbyGymsUseCase } from '@/application/users/use-cases/fetch-nearby-gyms'
import { GetUserMetricsUseCase } from '@/application/users/use-cases/get-user-metrics'
import { FetchUserCheckInsHistoryUseCase } from '@/application/users/use-cases/fetch-user-check-ins-history'
import { ValidateCheckInUseCase } from '@/application/users/use-cases/validate-check-in'
import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { PrismaClient } from '@prisma/client'
import { prisma } from '../database/prisma'
import { PrismaUserRepository } from '../repositories/prisma-users-repository'
import { PrismaGymsRepository } from '../repositories/prisma-gyms-repository'
import { PrismaCheckInRepository } from '../repositories/prisma-check-ins-repository'
import { AuthenticateController } from '../http/users/controllers/authenticate-controller'
import { UserRegisterController } from '../http/users/controllers/user-register-controller'
import { ProfileController } from '../http/users/controllers/profile'
import { AuthenticateService } from '@/application/users/services/authenticate-service'

// Registering Repositories
container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)
container.registerSingleton<IGymRepository>(
  'GymRepository',
  PrismaGymsRepository,
)
container.registerSingleton<ICheckInRepository>(
  'CheckInRepository',
  PrismaCheckInRepository,
)

// Register the global PrismaClient instance so repositories can inject it
container.register<PrismaClient>(PrismaClient, { useValue: prisma })

// Registering Use Cases
container.registerSingleton(RegisterUserUseCase.name, RegisterUserUseCase)
container.registerSingleton(AuthenticateUseCase.name, AuthenticateUseCase)
container.registerSingleton(GetUserProfileUseCase.name, GetUserProfileUseCase)
container.registerSingleton(CreateGymUseCase.name, CreateGymUseCase)
container.registerSingleton(SearchGymUseCase.name, SearchGymUseCase)
container.registerSingleton(FetchNearbyGymsUseCase.name, FetchNearbyGymsUseCase)
container.registerSingleton(GetUserMetricsUseCase.name, GetUserMetricsUseCase)
container.registerSingleton(CheckInUseCase.name, CheckInUseCase)
container.registerSingleton(
  FetchUserCheckInsHistoryUseCase.name,
  FetchUserCheckInsHistoryUseCase,
)
container.registerSingleton(ValidateCheckInUseCase.name, ValidateCheckInUseCase)

// Registering Services
container.registerSingleton(AuthenticateService.name, AuthenticateService)

// Registering Controllers
container.registerSingleton(UserRegisterController.name, UserRegisterController)
container.registerSingleton(AuthenticateController.name, AuthenticateController)
container.registerSingleton(ProfileController.name, ProfileController)
