import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { ValidateCheckInUseCase } from './validate-check-in'
import { NotFoundError } from '@/shared/errors/not-found-error'
import { UnprocessableEntityError } from '@/shared/errors/unprocessable-entity'
import { randomUUID } from 'node:crypto'

describe('ValidateCheck-in Use Case test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let sut: ValidateCheckInUseCase

  beforeEach(async () => {
    // Changed to async for potential future async setup
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    sut = new ValidateCheckInUseCase(inMemoryCheckInRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to validate check in', async () => {
    const checkIn = await inMemoryCheckInRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    if (checkIn.isRight()) {
      await sut.execute({
        id: checkIn.value.id,
      })

      expect(checkIn.isRight()).toBeTruthy()
      if (checkIn.isRight()) {
        expect(checkIn.value.validateAt).toEqual(expect.any(Date))
        expect(inMemoryCheckInRepository.items[0].validateAt).toEqual(
          checkIn.value.validateAt,
        )
      }
    }
  })

  it('should not be able to validate check in to validate inexistent check in', async () => {
    await inMemoryCheckInRepository.create({
      gymId: randomUUID(),
      userId: randomUUID(),
    })

    // Call execute with a valid UUID that doesn't exist
    const result = await sut.execute({
      id: randomUUID(), // Generate a valid but non-existent UUID
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to validate the check-in after 20 minutes of its creation', async () => {
    vi.setSystemTime(new Date(2023, 0, 1, 10, 40)) // Set a fixed time

    const createdCheckIn = await inMemoryCheckInRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    if (createdCheckIn.isRight()) {
      const twentyOneMinutesInMs = 1000 * 60 * 21
      vi.advanceTimersByTime(twentyOneMinutesInMs) // Advance time by 21 minutes

      const result = await sut.execute({
        id: createdCheckIn.value.id,
      })

      expect(result.isLeft()).toBeTruthy()
      expect(result.value).toBeInstanceOf(UnprocessableEntityError)
    }
  })
})
