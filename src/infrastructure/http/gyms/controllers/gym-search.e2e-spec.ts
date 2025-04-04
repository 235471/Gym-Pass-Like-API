import request from 'supertest'
import { app } from '@/app'
import { faker } from '@faker-js/faker'

describe('Search Gyms (E2E)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()
    // Create and authenticate user within beforeAll
    const email = faker.internet.email()
    const password = 'ValidP@ssw0rd'
    await request(app.server).post('/users').send({
      name: faker.person.fullName(),
      email,
      password,
    })
    const authResponse = await request(app.server).post('/users/auth').send({
      email,
      password,
    })
    token = authResponse.body.accessToken // Correct property name
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search gyms by title', async () => {
    // Use token from beforeAll

    // Create some gyms first
    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'JavaScript Gym',
        description: null,
        phone: null,
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'TypeScript Gym',
        description: null,
        phone: null,
        latitude: -27.0092052,
        longitude: -49.0001091,
      })

    // Search for gyms containing "Script"
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'Script' }) // Use query instead of title
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body).toHaveLength(2)
    // Use expect.arrayContaining for order-independent check
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'JavaScript Gym' }),
        expect.objectContaining({ title: 'TypeScript Gym' }),
      ]),
    )
  })

  it('should be able to search gyms by title and paginate', async () => {
    // Use token from beforeAll

    // Create multiple gyms
    for (let i = 1; i <= 22; i++) {
      await request(app.server)
        .post('/gyms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `JavaScript Gym ${i}`,
          description: null,
          phone: null,
          latitude: -27.2092052,
          longitude: -49.6401091,
        })
    }

    // Search page 2
    const response = await request(app.server)
      .get('/gyms/search')
      .query({ query: 'JavaScript', page: 2 })
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toBeInstanceOf(Array)

    expect(response.body.length).toBe(4)

    response.body.forEach((gym: { title: string }) => {
      expect(gym.title).toContain('JavaScript')
    })
  })
})
