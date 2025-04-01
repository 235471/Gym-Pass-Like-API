import { CheckIn } from '@prisma/client'

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
  userLatitude: number
  userLongitude: number
}

export interface FetchCheckInHistoryDTO {
  checkIns: CheckIn[]
}

export interface ValidateCheckInDTO {
  id: string
}
