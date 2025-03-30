import { z } from 'zod'

// Schema base para email
export const emailSchema = z.string().email('Invalid email format')

// Schema para senha forte (usado no registro)
export const strongPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long.')
  .regex(
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).*$/,
    'Password must contain at least one uppercase letter, one number, and one special character.',
  )

// Schema para registro de usuário
export const registerUserSchema = z.object({
  name: z.string().nonempty('Name is required.'),
  email: emailSchema,
  password: strongPasswordSchema,
})

// Schema para autenticação (apenas email válido e senha não-vazia)
export const authenticateUserSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty('Password cannot be empty.'),
})

// Types
export type RegisterUserSchemaInput = z.infer<typeof registerUserSchema>
export type AuthenticateUserSchemaInput = z.infer<typeof authenticateUserSchema>
