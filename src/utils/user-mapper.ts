import { User } from '@prisma/client'
import { UserDTO } from '@/types/user'

export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
