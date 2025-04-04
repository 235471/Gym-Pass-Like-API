import { CheckIn } from '@prisma/client'

export interface CheckInDTO {
  id: string
  userId: string
  gymId: string
  createdAt: Date
  validateAt: Date | null
}

export interface CreateCheckInUseCaseDTO {
  userId: string
  gymId: string
  userLatitude: number
  userLongitude: number
}

// DTO for Route Parameters
export interface CreateCheckInParamsDTO {
  gymId: string
}

export interface CheckInPageParamsDTO {
  page: number
}

// DTO for Request Body
export interface CreateCheckInBodyDTO {
  userLatitude: number
  userLongitude: number
}

export interface FetchCheckInHistoryDTO {
  checkIns: CheckIn[]
}

export interface ValidateCheckInDTO {
  id: string
}

// DTO for Validate CheckIn Route Parameters
export interface ValidateCheckInParamsDTO {
  checkInId: string
}

export type FetchCheckInDTO = {
  userId: string
  page: number
}

export interface ListCheckInDTO {
  id: string
  userId: string
  gymId: string
}
