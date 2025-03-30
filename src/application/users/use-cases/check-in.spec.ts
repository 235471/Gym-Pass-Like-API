import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { CheckInUseCase } from './check-in'
import { randomUUID } from 'node:crypto'

describe('Check-in test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let sut: CheckInUseCase

  beforeEach(() => {
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    sut = new CheckInUseCase(inMemoryCheckInRepository)
  })

  it('should be able to check in', async () => {
    const payload = {
      gymId: randomUUID(),
      userId: randomUUID(),
    }
    const result = await sut.execute(payload)

    if (result.isRight()) {
      const checkIn = result.value
      expect(checkIn.id).toEqual(expect.any(String))
    }
  })
})
