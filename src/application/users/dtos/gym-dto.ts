import { Decimal } from '@prisma/client/runtime/library'

export interface GymDTO {
  id: string
  title: string
  description: string
  phone: string
  latitude: Decimal
  longitude: Decimal
}

export interface RegisterGymDTO {
  title: string
  description: string | null
  phone: string | null
  latitude: number | Decimal
  longitude: number | Decimal
}

export interface QueryGymNameDTO {
  title: string
  page: number
}

export interface SearchNearbyGymDTO {
  userLatitude: number
  userLongitude: number
}

export interface ListGymsDTO {
  title: string
  description: string | undefined
  phone: string | undefined
}
