import { CreateUserDTO, UserDTO } from '@/types/user'
import { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { IUserService } from './interfaces/IUserService'
import { User } from '@prisma/client'

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  private mapUserToDTO(user: User | null): UserDTO | null {
    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async create(data: CreateUserDTO): Promise<UserDTO> {
    const user = await this.userRepository.create(data)
    return this.mapUserToDTO(user) as UserDTO
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findByEmail(email)
    return this.mapUserToDTO(user)
  }

  async findById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(id)
    return this.mapUserToDTO(user)
  }
}
