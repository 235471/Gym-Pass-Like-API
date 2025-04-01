import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { ValidateCheckInUseCase } from './validate-check-in'
import { NotFoundError } from '@/shared/errors/not-found-error'

describe('ValidateCheck-in Use Case test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let sut: ValidateCheckInUseCase

  beforeEach(async () => {
    // Changed to async for potential future async setup
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    sut = new ValidateCheckInUseCase(inMemoryCheckInRepository)

    // vi.useFakeTimers()
  })

  afterEach(() => {
    // vi.useRealTimers()
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
    const checkIn = await inMemoryCheckInRepository.create({
      gymId: 'gym-01',
      userId: 'user-01',
    })

    if (checkIn.isRight()) {
      const result = await sut.execute({
        id: 'inexistent-check-in-id',
      })

      expect(result.isLeft()).toBeTruthy()
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })
})
