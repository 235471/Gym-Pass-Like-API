export interface UserDTO {
  id: string
  name: string
  email: string
  createdAt?: Date
  updatedAt?: Date | null
}

export interface CreateUserDTO {
  name: string
  email: string
  passwordHash: string
}

export interface ResponseDTO<T> {
  data: T
}

export interface UserResponseDTO extends ResponseDTO<UserDTO> {}
