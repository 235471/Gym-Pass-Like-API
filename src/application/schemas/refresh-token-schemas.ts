import { z } from 'zod'

export const refreshTokenRequestBodySchema = z.object({
  refreshToken: z.string().nonempty('Refresh token is required.'),
})

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type RefreshTokenRequestBodyInput = z.infer<
  typeof refreshTokenRequestBodySchema
>
