import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'
import { randomUUID } from 'node:crypto'
import { CreateCheckInDTO } from '../dtos/check-in-dto'
import { TooManyRequestsError } from '@/shared/errors/too-many-requests'
import { InMemoryGymRepository } from '@/domains/gyms/repository/in-memory/in-memory-gym-repository'
import { MakeGym } from '@/shared/test/factories/make-gym'
import { GymDTO } from '../dtos/gym-dto'
import { Decimal } from '@prisma/client/runtime/library'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { NotFoundError } from '@/shared/errors/not-found-error' // Added for new test

let payload: CreateCheckInDTO
describe('Check-in test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let inMemoryGymRepository: InMemoryGymRepository
  let sut: CheckInUseCase
  let gym: GymDTO

  beforeEach(async () => {
    // Changed to async for potential future async setup
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    inMemoryGymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(inMemoryCheckInRepository, inMemoryGymRepository)

    vi.useFakeTimers()

    // Create gym first
    gym = MakeGym({
      // Use specific ID for predictability
      id: 'gym-01',
      latitude: new Decimal(51.5075),
      longitude: new Decimal(-0.1279),
    })
    await inMemoryGymRepository.create(gym) // Use await if create becomes async

    payload = {
      gymId: gym.id, // Use the created gym's ID
      userId: randomUUID(),
      userLatitude: 51.5074,
      userLongitude: -0.1278,
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    // No need to clear items manually if using a fresh instance each time
  })

  it('should be able to check in', async () => {
    const result = await sut.execute(payload)

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      const checkIn = result.value
      expect(checkIn.id).toEqual(expect.any(String))
      expect(checkIn.gymId).toBe(payload.gymId) // Corrected to camelCase
      expect(checkIn.userId).toBe(payload.userId) // Corrected to camelCase
      expect(checkIn.createdAt).toBeInstanceOf(Date) // Corrected to camelCase
    }
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 5, 0, 0))

    await sut.execute(payload) // First check-in

    const result = await sut.execute(payload) // Attempt second check-in

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(TooManyRequestsError)
      expect(error.message).toBe(
        'You can only check in to one gym per day. Please try again tomorrow.',
      )
    }
  })

  it('should be able to check in on different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 5, 0, 0))
    await sut.execute(payload) // First check-in

    vi.setSystemTime(new Date(2022, 0, 21, 10, 0, 0)) // Advance time to next day
    const result = await sut.execute(payload) // Second check-in

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      const checkIn = result.value
      expect(checkIn.id).toEqual(expect.any(String))
      expect(checkIn.gymId).toBe(payload.gymId)
      expect(checkIn.userId).toBe(payload.userId)
    }
  })

  it('should not be able to check in at a distant gym', async () => {
    // Update the coordinates of the existing gym to be far away
    gym.latitude = new Decimal(52.5085) // Significantly different latitude
    gym.longitude = new Decimal(-0.1278)
    inMemoryGymRepository.items = [gym] // Replace items array

    const result = await sut.execute({
      ...payload,
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe(
        'You are too far away from the gym to perform a check in',
      )
    }
  })

  it('should not be able to check in if the gym does not exist', async () => {
    const result = await sut.execute({
      ...payload,
      gymId: 'non-existent-gym-id', // Use an ID that is not in the repository
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(NotFoundError) // Expecting a NotFoundError
      expect(error.message).toBe('Resource not found') // Or a more specific gym not found message
    }
  })
})
