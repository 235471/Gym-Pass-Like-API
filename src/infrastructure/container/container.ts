import { container } from 'tsyringe'
import { RegisterUserUseCase } from '@/application/use-cases/register-user'
import { AuthenticateUseCase } from '@/application/use-cases/authenticate'
import { GetUserProfileUseCase } from '@/application/use-cases/get-user-profile'
import { CheckInUseCase } from '@/application/use-cases/check-in'
import { CreateGymUseCase } from '@/application/use-cases/create-gym'
import { SearchGymUseCase } from '@/application/use-cases/search-gym'
import { FetchNearbyGymsUseCase } from '@/application/use-cases/fetch-nearby-gyms'
import { GetUserMetricsUseCase } from '@/application/use-cases/get-user-metrics'
import { FetchUserCheckInsHistoryUseCase } from '@/application/use-cases/fetch-user-check-ins-history'
import { ValidateCheckInUseCase } from '@/application/use-cases/validate-check-in'
import { AuthenticateService } from '@/application/services/authenticate-service'
import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { IRefreshTokenRepository } from '@/domains/users/repository/IRefreshTokenRepository'
import { PrismaClient } from '@prisma/client'
import { prisma } from '../database/prisma'
import { PrismaUserRepository } from '../repositories/prisma-users-repository'
import { PrismaGymsRepository } from '../repositories/prisma-gyms-repository'
import { PrismaCheckInRepository } from '../repositories/prisma-check-ins-repository'
import { PrismaRefreshTokenRepository } from '../repositories/prisma-refresh-token-repository'
import { AuthenticateController } from '../http/users/controllers/authenticate-controller'
import { UserRegisterController } from '../http/users/controllers/user-register-controller'
import { GymRegisterController } from '../http/gyms/controllers/gym-register'
import { GymSearchController } from '../http/gyms/controllers/gym-search'
import { GymNearbyController } from '../http/gyms/controllers/gym-nearby'
import { CheckInCreateController } from '../http/check-ins/controllers/check-in-create'
import { CheckInHistoryController } from '../http/check-ins/controllers/check-in-history'
import { CheckInMetricsController } from '../http/check-ins/controllers/check-in-metrics'
import { CheckInValidateController } from '../http/check-ins/controllers/check-in-validate'
import { ProfileController } from '../http/users/controllers/profile-controller'
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/application/use-cases/logout'
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
container.registerSingleton<IRefreshTokenRepository>(
  'RefreshTokenRepository',
  PrismaRefreshTokenRepository,
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
container.registerSingleton(RefreshTokenUseCase.name, RefreshTokenUseCase)
container.registerSingleton(LogoutUseCase.name, LogoutUseCase)

// Registering Services
container.registerSingleton(AuthenticateService.name, AuthenticateService)

// Registering Controllers
container.registerSingleton(UserRegisterController.name, UserRegisterController)
container.registerSingleton(AuthenticateController.name, AuthenticateController)
container.registerSingleton(ProfileController.name, ProfileController)
container.registerSingleton(GymRegisterController.name, GymRegisterController)
container.registerSingleton(GymSearchController.name, GymSearchController)
container.registerSingleton(GymNearbyController.name, GymNearbyController)
container.registerSingleton(
  CheckInCreateController.name,
  CheckInCreateController,
)
container.registerSingleton(
  CheckInHistoryController.name,
  CheckInHistoryController,
)
container.registerSingleton(
  CheckInMetricsController.name,
  CheckInMetricsController,
)
container.registerSingleton(
  CheckInValidateController.name,
  CheckInValidateController,
)
