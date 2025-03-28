import { CreateUserDTO, UserDTO } from '@/types/user'

export interface IUserService {
  create(data: CreateUserDTO): Promise<UserDTO>
  findByEmail(email: string): Promise<UserDTO | null>
  findById(id: string): Promise<UserDTO | null>
}
