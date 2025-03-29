import { CreateUserDTO, UserDTO } from '@/types/user'
import { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { IUserService } from './interfaces/IUserService'
import { User } from '@prisma/client'
import { injectable, inject } from 'tsyringe'
import { Either, left, right } from '@/types/either'
import { IError } from '@/http/errors/interface/error'
import { ConflictError } from '@/http/errors/conflict-error'
import { NotFoundError } from '@/http/errors/not-found-error'
import { hash } from 'bcryptjs'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
  ) {
    console.log('UserService initialized')
  }

  private mapUserToDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async create(data: CreateUserDTO): Promise<Either<IError, UserDTO>> {
    const emailCheckResult = await this.userRepository.findByEmail(data.email)

    if (emailCheckResult.isLeft()) {
      return left(emailCheckResult.value)
    }

    const existingUser = emailCheckResult.value
    if (existingUser) {
      return left(new ConflictError(`Email '${data.email}' is already in use`))
    }

    const passwordHash = await hash(data.passwordHash, 6)

    const createResult = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    })

    if (createResult.isLeft()) {
      return left(createResult.value)
    }

    const userDTO = this.mapUserToDTO(createResult.value)

    return right(userDTO)
  }

  async findByEmail(email: string): Promise<Either<IError, UserDTO | null>> {
    const result = await this.userRepository.findByEmail(email)

    if (result.isLeft()) {
      return left(result.value)
    }

    const user = result.value
    if (!user) {
      return left(new NotFoundError(`User with email '${email}' not found`))
    }

    const userDTO = this.mapUserToDTO(user)
    return right(userDTO)
  }

  async findById(id: string): Promise<Either<IError, UserDTO | null>> {
    const result = await this.userRepository.findById(id)

    if (result.isLeft()) {
      return left(result.value)
    }

    const user = result.value
    if (!user) {
      return left(new NotFoundError(`User with id '${id}' not found`))
    }

    const userDTO = this.mapUserToDTO(user)
    return right(userDTO)
  }
}
