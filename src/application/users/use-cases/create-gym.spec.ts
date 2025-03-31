import { CreateGymUseCase } from './create-gym'
import { InMemoryGymRepository } from '@/domains/gyms/repository/in-memory/in-memory-gym-repository'
import { MakeGym } from '@/shared/test/factories/make-gym'
import { ValidationErrors } from '@/shared/errors/validation-errors'
import { RegisterGymDTO } from '../dtos/gym-dto'

let sut: CreateGymUseCase
let inMemoryGymRepository: InMemoryGymRepository

describe('Create Gym Use Case', () => {
  beforeEach(() => {
    inMemoryGymRepository = new InMemoryGymRepository()
    sut = new CreateGymUseCase(inMemoryGymRepository)
  })

  afterEach(() => {
    inMemoryGymRepository.items = []
  })

  it('should create a gym successfully', async () => {
    const gymData = MakeGym()

    const createGym: RegisterGymDTO = {
      ...gymData,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    }

    const result = await sut.execute(createGym)

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value).toHaveProperty('id')
      expect(result.value.title).toBe(gymData.title)
    }
  })

  it('should return an error if validation fails', async () => {
    const gymData = MakeGym({ title: '' })

    const createGym: RegisterGymDTO = {
      ...gymData,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    }

    const result = await sut.execute(createGym)

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value as ValidationErrors
      expect(error).toBeInstanceOf(ValidationErrors)
      expect(error.errors).toHaveLength(1)
      expect(error.errors[0]).toHaveProperty('message')
      expect(error.errors[0].message).toBe('Title is required.')
    }
  })
})
