import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryGymRepository } from '@/domains/gyms/repository/in-memory/in-memory-gym-repository'
import { MakeGym } from '@/shared/test/factories/make-gym'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'
import { Decimal } from '@prisma/client/runtime/library'

let inMemoryGymRepository: InMemoryGymRepository
let sut: FetchNearbyGymsUseCase // System Under Test

describe('Fetch Nearby Gyms Use Case', () => {
  beforeEach(async () => {
    inMemoryGymRepository = new InMemoryGymRepository()
    sut = new FetchNearbyGymsUseCase(inMemoryGymRepository) // Using the provided class name
  })

  afterEach(() => {
    inMemoryGymRepository.items = []
  })

  it('should be able to fetch nearby gyms', async () => {
    // Create gyms
    await inMemoryGymRepository.create(
      MakeGym({
        title: 'JavaScript Gym',
        latitude: new Decimal(51.5025),
        longitude: new Decimal(-0.1441),
      }),
    )

    await inMemoryGymRepository.create(
      MakeGym({
        title: 'TypeScript Gym',
        latitude: new Decimal(51.5168),
        longitude: new Decimal(-0.1375),
      }),
    )

    await inMemoryGymRepository.create(
      MakeGym({
        title: 'Python Gym',
        latitude: new Decimal(51.4982),
        longitude: new Decimal(-0.1204),
      }),
    )

    await inMemoryGymRepository.create(
      MakeGym({
        title: 'Out of Bounds Gym',
        latitude: new Decimal(51.4),
        longitude: new Decimal(-0.2),
      }),
    )

    // Execute search
    const result = await sut.execute({
      userLatitude: 51.5074,
      userLongitude: -0.1278,
    })

    // Assert
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toHaveLength(3)
      expect(result.value).toEqual([
        expect.objectContaining({ title: 'JavaScript Gym' }),
        expect.objectContaining({ title: 'TypeScript Gym' }),
        expect.objectContaining({ title: 'Python Gym' }),
      ])
    }
  })

  it('should return an empty array if no gyms are nearby', async () => {
    // No gyms created

    // Execute search
    const result = await sut.execute({
      userLatitude: 51.5074,
      userLongitude: -0.1278,
    })

    // Assert
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toHaveLength(0)
    }
  })
})
