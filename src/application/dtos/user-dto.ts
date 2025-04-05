export interface UserDTO {
  id: string
  name: string
  email: string
  password: string
  createdAt?: Date
  updatedAt?: Date | null
}

// DTO for user profile response (excludes password)
export interface UserProfileDTO {
  id: string
  name: string
  email: string
  role: string
}

export interface CreateUserDTO {
  name: string
  email: string
  passwordHash: string
  role?: string
}

// DTO for user registration
export interface RegisterUserDTO {
  name: string
  email: string
  password: string
  role?: string
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
