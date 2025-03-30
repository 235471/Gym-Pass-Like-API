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
  description: string
  phone: string
  latitude: number
  longitude: number
}
