import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { makeCheckIn } from '@/shared/test/factories/make-check-in'
import { randomUUID } from 'node:crypto'
import { GetUserMetricsUseCase } from './get-user-metrics'

describe('Get Users Metrics Use Case test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let sut: GetUserMetricsUseCase

  beforeEach(async () => {
    // Changed to async for potential future async setup
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    sut = new GetUserMetricsUseCase(inMemoryCheckInRepository)
  })

  it('should return the correct check-in count for a user', async () => {
    const userId = randomUUID()
    for (let i = 0; i < 4; i++) {
      await inMemoryCheckInRepository.create(
        makeCheckIn({
          userId,
          gymId: `gym-0${i + 1}`,
        }),
      )
    }

    const result = await sut.execute({
      userId,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const checkIns = result.value.checkInsCount
      expect(checkIns).toEqual(4)
    }
  })

  it("should return 0 check-ins when a user haven't made any", async () => {
    const userId = randomUUID()

    const result = await sut.execute({
      userId,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const checkIns = result.value.checkInsCount
      expect(checkIns).toEqual(0)
    }
  })
})
