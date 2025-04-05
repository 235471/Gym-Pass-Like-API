import { faker } from '@faker-js/faker'
import { RegisterUserDTO } from '@/application/dtos/user-dto'

export function makeUser(
  override: Partial<RegisterUserDTO> = {},
): RegisterUserDTO {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10, prefix: '!A1' }), // Gera uma senha um pouco mais complexa
    ...override,
  }
}
