import { InMemoryCheckInRepository } from '@/domains/checkin/repository/in-memory/in-memory-check-in-repository'
import { FetchUserCheckInsHistoryUseCase } from './fetch-user-check-ins-history'
import { makeCheckIn } from '@/shared/test/factories/make-check-in'
import { randomUUID } from 'node:crypto'

describe('Fetch User Check In History test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let sut: FetchUserCheckInsHistoryUseCase

  beforeEach(async () => {
    // Changed to async for potential future async setup
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    sut = new FetchUserCheckInsHistoryUseCase(inMemoryCheckInRepository)
  })

  it('should be able to fetch check-in history', async () => {
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
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const checkIns = result.value.checkIns
      expect(checkIns.length).toBe(4)
      expect(checkIns[0].id).toBeDefined()
      expect(checkIns[1].id).toBeDefined()
      expect(checkIns[2].id).toBeDefined()
      expect(checkIns[3].id).toBeDefined()
      expect(checkIns).toEqual([
        expect.objectContaining({ gymId: 'gym-01' }),
        expect.objectContaining({ gymId: 'gym-02' }),
        expect.objectContaining({ gymId: 'gym-03' }),
        expect.objectContaining({ gymId: 'gym-04' }),
      ])
    }
  })

  it('should be able to fetch check-in history', async () => {
    const userId = randomUUID()
    for (let i = 0; i < 22; i++) {
      await inMemoryCheckInRepository.create(
        makeCheckIn({
          userId,
          gymId: `gym-${i + 1}`,
        }),
      )
    }

    const result = await sut.execute({
      userId,
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      const checkIns = result.value.checkIns
      expect(checkIns.length).toBe(2)
      expect(checkIns).toEqual([
        expect.objectContaining({ gymId: 'gym-21' }),
        expect.objectContaining({ gymId: 'gym-22' }),
      ])
    }
  })
})
