export interface UserDTO {
  id: string
  name: string
  email: string
  password: string
  createdAt?: Date
  updatedAt?: Date | null
}

export interface CreateUserDTO {
  name: string
  email: string
  passwordHash: string
}

// DTO para registrar usuários (usado pelo caso de uso)
export interface RegisterUserDTO {
  name: string
  email: string
  password: string
}
// DTO para autenticar usuários (usado pelo caso de uso)
export interface AuthenticateUserDTO {
  email: string
  password: string
}
