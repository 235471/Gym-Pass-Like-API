import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryGymRepository } from '@/domains/gyms/repository/in-memory/in-memory-gym-repository'
import { MakeGym } from '@/shared/test/factories/make-gym'
import { SearchGymUseCase } from './search-gym'

let gymsRepository: InMemoryGymRepository
let sut: SearchGymUseCase // System Under Test

describe('Search Gyms Use Case', () => {
  beforeEach(async () => {
    gymsRepository = new InMemoryGymRepository()
    sut = new SearchGymUseCase(gymsRepository) // Using the provided class name
  })

  it('should be able to search for gyms by title', async () => {
    // Create gyms
    await gymsRepository.create(
      MakeGym({
        title: 'JavaScript Gym',
      }),
    )
    await gymsRepository.create(
      MakeGym({
        title: 'TypeScript Gym',
      }),
    )

    await gymsRepository.create(
      MakeGym({
        title: 'Java Gym',
      }),
    )

    // Execute search
    const result = await sut.execute({
      title: 'Script',
      page: 1,
    })

    // Assert
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toHaveLength(2)
      expect(result.value).toEqual([
        expect.objectContaining({ title: 'JavaScript Gym' }),
        expect.objectContaining({ title: 'TypeScript Gym' }),
      ])
    }
  })

  it('should be able to fetch paginated gym search', async () => {
    // Create 22 gyms
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create(
        MakeGym({
          title: `TypeScript Gym ${i}`,
        }),
      )
    }

    // Execute search for page 2
    const result = await sut.execute({
      title: 'TypeScript',
      page: 2,
    })

    // Assert
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toHaveLength(2) // 20 on page 1, 2 on page 2
      expect(result.value[0].title).toEqual('TypeScript Gym 21')
      expect(result.value[1].title).toEqual('TypeScript Gym 22')
    }
  })
})
