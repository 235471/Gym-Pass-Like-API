export interface CheckInDTO {
  id: string
  userId: string
  gymId: string
  createdAt: Date
  validateAt: Date | null
}

export interface CreateCheckInDTO {
  userId: string
  gymId: string
}
