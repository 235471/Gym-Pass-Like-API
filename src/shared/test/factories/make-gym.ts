import { Decimal } from '@prisma/client/runtime/library'
import { GymDTO } from '@/application/users/dtos/gym-dto'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'

export function MakeGym(override: Partial<GymDTO> = {}): GymDTO {
  return {
    id: randomUUID(),
    title: faker.company.name(),
    description: faker.lorem.sentence(),
    phone: faker.phone.number(),
    latitude: new Decimal(faker.location.latitude()),
    longitude: new Decimal(faker.location.longitude()),
    ...override,
  }
}
