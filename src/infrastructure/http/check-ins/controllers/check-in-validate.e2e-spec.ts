import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { faker } from '@faker-js/faker'

describe('Validate Check-in (E2E)', () => {
  let token: string

  beforeAll(async () => {
    await app.ready()

    // Criar e autenticar o usuário diretamente
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

    token = authResponse.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return 404 when validating a nonexistent check-in', async () => {
    // Testar com um ID de check-in que não existe
    const nonExistentCheckInId = '00000000-0000-0000-0000-000000000000'

    // Tentar validar um check-in que não existe
    const response = await request(app.server)
      .patch(`/check-ins/${nonExistentCheckInId}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    // Verificar se recebemos 404 pois o check-in não existe
    expect(response.statusCode).toEqual(404)
    expect(response.body).toHaveProperty('error', 'NotFoundError')
  })

  it('should be able to validate a check-in', async () => {
    // 1. Register gym
    const createGymResponse = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Academia JavaScript',
        description: 'A melhor academia para devs',
        phone: '11999999999',
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    expect(createGymResponse.statusCode).toEqual(201)
    const gymId = createGymResponse.body.id

    // 2. Register a check-in for the gym
    const createCheckInResponse = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      })

    expect(createCheckInResponse.statusCode).toEqual(201)
    const checkInId = createCheckInResponse.body.id

    // 3. Validate the check-in
    const validateResponse = await request(app.server)
      .patch(`/check-ins/${checkInId}/validate`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(validateResponse.statusCode).toEqual(204)

    // 4. Check if the check-in was validated
    const historyResponse = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(historyResponse.statusCode).toEqual(200)

    // Define a type for the check-in response
    interface CheckIn {
      id: string
      validateAt: string | null
    }

    // Encontrar o check-in validado
    const validatedCheckIn = historyResponse.body.find(
      (checkIn: CheckIn) => checkIn.id === checkInId,
    )

    expect(validatedCheckIn).toBeDefined()
    expect(validatedCheckIn.validateAt).not.toBeNull()
  })
})
