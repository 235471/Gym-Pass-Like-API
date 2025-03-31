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

// DTO for user registration
export interface RegisterUserDTO {
  name: string
  email: string
  password: string
}
// DTO for authentication
export interface AuthenticateUserDTO {
  email: string
  password: string
}

// DTO get user metrics
export interface UserMetricsDTO {
  checkInsCount: number
}
