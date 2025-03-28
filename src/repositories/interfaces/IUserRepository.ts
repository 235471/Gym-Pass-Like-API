import { User } from '@prisma/client'
import { CreateUserDTO } from '@/types/user'

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
