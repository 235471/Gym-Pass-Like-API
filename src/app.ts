import fastify from 'fastify'

const app = fastify()

app.get('/', () => {
  return 'Gympass like API with SOLID principles'
})

export { app }
