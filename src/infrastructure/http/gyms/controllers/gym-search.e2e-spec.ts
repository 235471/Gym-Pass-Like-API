import request from 'supertest'
import { app } from '@/app'
import { prismaTestClient } from '@/shared/test/setup-e2e' // Import test client
import { createAndAuthenticateE2EUser } from '@/shared/utils/test-auth'
import { MakeGymRequest } from '@/shared/test/factories/make-gym'

describe('Search Gyms (E2E)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    // Authenticate the user
    const { accessToken } = await createAndAuthenticateE2EUser(app)
    token = accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(async () => {
    // Clean up gyms after each test
    await prismaTestClient.gym.deleteMany()
  })

  it('should be able to search gyms by title', async () => {
    const gym = MakeGymRequest({
      title: 'JavaScript Gym',
    })

    const gym2 = MakeGymRequest({
      title: 'TypeScript Gym',
    })

    // Create gyms directly using prismaTestClient
    await prismaTestClient.gym.create({
      data: gym,
    })

    await prismaTestClient.gym.create({
      data: gym2,
    })

    // Search for gyms containing "Script"
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'Script' }) // Use query instead of title
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.gyms).toBeInstanceOf(Array)
    expect(response.body.gyms).toHaveLength(2)
    // Use expect.arrayContaining for order-independent check
    expect(response.body.gyms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'JavaScript Gym' }),
        expect.objectContaining({ title: 'TypeScript Gym' }),
      ]),
    )
  })

  it('should be able to search gyms by title and paginate', async () => {
    // Use token from beforeAll

    // Create multiple gyms directly using prismaTestClient
    for (let i = 1; i <= 22; i++) {
      const gym = MakeGymRequest({
        title: `JavaScript Gym ${i}`,
      })

      await prismaTestClient.gym.create({
        data: gym,
      })
    }

    // Search page 2
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'JavaScript', page: 2 })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.gyms).toBeInstanceOf(Array)

    // Expect exactly 2 results on page 2
    expect(response.body.gyms).toHaveLength(2)
    expect(response.body.gyms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.stringContaining('JavaScript'),
        }),
        expect.objectContaining({
          title: expect.stringContaining('JavaScript'),
        }),
      ]),
    )
  })
})
