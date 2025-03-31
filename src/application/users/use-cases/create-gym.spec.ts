import { CreateGymUseCase } from './create-gym'
import { InMemoryGymRepository } from '@/domains/gyms/repository/in-memory/in-memory-gym-repository'
import { Decimal } from '@prisma/client/runtime/library' // Added import
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

  it('should create a gym successfully with null description', async () => {
    const gymData = MakeGym() // Create gym with default string description

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: null, // Set description to null here
      phone: gymData.phone,
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    }

    const result = await sut.execute(createGym)

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value).toHaveProperty('id')
      expect(result.value.title).toBe(gymData.title)
      expect(result.value.description).toBeNull() // Check if description is null
    }
  })

  it('should create a gym successfully with null phone', async () => {
    const gymData = MakeGym() // Create gym with default string phone

    const createGym: RegisterGymDTO = {
      title: gymData.title,
      description: gymData.description,
      phone: null, // Set phone to null here
      latitude: Number(gymData.latitude),
      longitude: Number(gymData.longitude),
    }

    const result = await sut.execute(createGym)

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value).toHaveProperty('id')
      expect(result.value.title).toBe(gymData.title)
      expect(result.value.phone).toBeNull() // Check if phone is null
    }
  })

  // --- Latitude/Longitude Tests ---

  it('should return an error if latitude is invalid', async () => {
    // Use Decimal for the invalid latitude
    const gymData = MakeGym({ latitude: new Decimal('91') })

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
      // Assuming the validation message is something like this
      expect(error.errors[0].message).toContain(
        'Latitude must be less than or equal to 90', // Corrected capitalization
      )
    }
  })

  it('should return an error if latitude is less than -90', async () => {
    // Use Decimal for the invalid latitude
    const gymData = MakeGym({ latitude: new Decimal('-91') })

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
      // Assuming the validation message reflects the lower bound check
      expect(error.errors[0].message).toContain(
        'Latitude must be greater than or equal to -90', // Corrected capitalization
      )
    }
  })

  it('should return an error if longitude is invalid', async () => {
    // Use Decimal for the invalid longitude
    const gymData = MakeGym({ longitude: new Decimal('181') })

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
      // Assuming the validation message is something like this
      expect(error.errors[0].message).toContain(
        'Longitude must be less than or equal to 180', // Corrected capitalization
      )
    }
  })

  it('should return an error if longitude is less than -180', async () => {
    // Use Decimal for the invalid longitude
    const gymData = MakeGym({ longitude: new Decimal('-181') })

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
      // Assuming the validation message reflects the lower bound check
      expect(error.errors[0].message).toContain(
        'Longitude must be greater than or equal to -180', // Corrected capitalization
      )
    }
  })
})
