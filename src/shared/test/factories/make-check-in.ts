import { CheckIn, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

// Define the structure for the factory function's return type and overrides
// It should align with Prisma.CheckInUncheckedCreateInput but allow overriding specific fields
type CheckInFactoryInput = Partial<Prisma.CheckInUncheckedCreateInput> & {
  id?: string // Allow overriding ID for specific test cases
  createdAt?: Date // Allow overriding createdAt
}

// Define the return type based on CheckIn, but ensure required fields are present
type CheckInFactoryOutput = CheckIn

export function makeCheckIn(
  override: CheckInFactoryInput = {},
): CheckInFactoryOutput {
  const checkIn: CheckInFactoryOutput = {
    id: override.id ?? randomUUID(),
    userId: override.userId ?? randomUUID(), // Default to a random user ID
    gymId: override.gymId ?? randomUUID(), // Default to a random gym ID
    createdAt: override.createdAt ?? new Date(), // Default to current date/time
    validateAt: override.validateAt ? new Date(override.validateAt) : null, // Handle optional validation date
  };

  return checkIn
}
