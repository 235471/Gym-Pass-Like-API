// Swagger configuration constants

export const swaggerConfig = {
  openapi: {
    info: {
      title: 'API SOLID',
      description: 'GymPass style API with SOLID principles',
      version: '1.0.0',
    },
    tags: [
      { name: 'users', description: 'User related endpoints' },
      { name: 'gyms', description: 'Gym related endpoints' },
      { name: 'check-ins', description: 'Check-in related endpoints' },
    ],
    // Add components section to define security schemes
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
}

export const swaggerUiConfig = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list' as 'list' | 'full' | 'none',
    deepLinking: false,
  },
}
