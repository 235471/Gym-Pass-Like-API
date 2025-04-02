import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    // Define the payload structure expected after verification
    payload: { sub: string } // The 'sub' property holds the user ID
    user: {
      sub: string
    }
  }
}
