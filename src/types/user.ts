export interface UserDTO {
  id: string
  name: string
  email: string
  createdAt?: Date
  updatedAt?: Date | null
}

export interface UserRegisterDTO {
  name: string
  email: string
  password: string
}

export interface ResponseDTO<T> {
  data: T
}

export interface UserResponseDTO extends ResponseDTO<UserDTO> {}
