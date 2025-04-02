import { User } from '@prisma/client'
import { UserDTO, UserProfileDTO } from '@/application/users/dtos/user-dto' // Import UserProfileDTO

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toProfileDTO(user: User): UserProfileDTO {
    // Exclude passwordHash
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
