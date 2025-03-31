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

let payload: CreateCheckInDTO
describe('Check-in test suite', () => {
  let inMemoryCheckInRepository: InMemoryCheckInRepository
  let inMemoryGymRepository: InMemoryGymRepository
  let sut: CheckInUseCase
  let gym: GymDTO

  beforeEach(() => {
    inMemoryCheckInRepository = new InMemoryCheckInRepository()
    inMemoryGymRepository = new InMemoryGymRepository()
    sut = new CheckInUseCase(inMemoryCheckInRepository, inMemoryGymRepository)

    vi.useFakeTimers()

    payload = {
      gymId: randomUUID(),
      userId: randomUUID(),
      userLatitude: 51.5074,
      userLongitude: -0.1278,
    }
    gym = MakeGym({
      id: payload.gymId,
      latitude: new Decimal(51.5075),
      longitude: new Decimal(-0.1279),
    })

    inMemoryGymRepository.create(gym)
  })

  afterEach(() => {
    vi.useRealTimers()
    inMemoryGymRepository.items = []
  })

  it('should be able to check in', async () => {
    const result = await sut.execute(payload)

    if (result.isRight()) {
      const checkIn = result.value
      expect(checkIn.id).toEqual(expect.any(String))
    }
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 5, 0, 0))

    await sut.execute(payload)

    const result = await sut.execute(payload)

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(TooManyRequestsError)
      expect(error.message).toBe(
        'You can only check in to one gym per day. Please try again tomorrow.',
      )
    }
  })

  it('should be able to check in different days', async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 5, 0, 0))

    await sut.execute(payload)

    vi.setSystemTime(new Date(2022, 0, 21, 10, 0, 0))

    const result = await sut.execute(payload)

    if (result.isRight()) {
      const checkIn = result.value
      expect(checkIn.id).toEqual(expect.any(String))
    }
  })

  it('should not be able to check in at a distant gym', async () => {
    const gym = MakeGym({
      latitude: new Decimal(51.5085),
      longitude: new Decimal(-0.1278),
    })

    await inMemoryGymRepository.create(gym)

    const result = await sut.execute(payload)

    if (result.isLeft()) {
      const error = result.value
      expect(error).toBeInstanceOf(BadRequestError)
      expect(error.message).toBe(
        'You are too far away from the gym to perform a check in',
      )
    }
  })
})
