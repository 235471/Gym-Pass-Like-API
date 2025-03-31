import { z } from 'zod'

// Base schema for email
export const emailSchema = z.string().email('Invalid email format')

// Schema for strong password used while registering an user
export const strongPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long.')
  .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter.')
  .regex(/(?=.*[0-9])/, 'Password must contain at least one number.')
  .regex(/(?=.*[!@#$%^&*()_+])/, 'Password must contain at least one special character.')

// Register user Schema
export const registerUserSchema = z.object({
  name: z.string().nonempty('Name is required.'),
  email: emailSchema,
  password: strongPasswordSchema,
})

// Schema for login authentication
export const authenticateUserSchema = z.object({
  email: emailSchema,
  password: z.string().nonempty('Password cannot be empty.'),
})

// Types
export type RegisterUserSchemaInput = z.infer<typeof registerUserSchema>
export type AuthenticateUserSchemaInput = z.infer<typeof authenticateUserSchema>
