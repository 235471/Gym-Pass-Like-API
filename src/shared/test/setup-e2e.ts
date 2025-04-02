import 'reflect-metadata' 
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { container } from 'tsyringe' 

// Import Repository Interfaces and Implementations
import { IUserRepository } from '@/domains/users/repository/IUserRepository'
import { IGymRepository } from '@/domains/gyms/repository/IGymRepository'
import { ICheckInRepository } from '@/domains/checkin/repository/ICheckInRepository'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-users-repository'
import { PrismaGymsRepository } from '@/infrastructure/repositories/prisma-gyms-repository'
import { PrismaCheckInRepository } from '@/infrastructure/repositories/prisma-check-ins-repository'

config({ path: '.env', override: true })

let schemaId: string
let testDatabaseUrl: string
let originalDatabaseUrl: string | undefined
let testPrismaClient: PrismaClient

beforeAll(async () => {
  // 1. Generate unique URL
  schemaId = randomUUID()
  originalDatabaseUrl = process.env.DATABASE_URL // Store original
  if (!originalDatabaseUrl) {
    throw new Error('DATABASE_URL not found in environment.')
  }
  const url = new URL(originalDatabaseUrl)
  url.searchParams.set('schema', schemaId)
  testDatabaseUrl = url.toString()

  // 2. Temporarily set env for migration command
  process.env.DATABASE_URL = testDatabaseUrl
  // console.log(`🚀 Running migrations for schema ${schemaId}...`) // Removed log
  try {
    execSync('npx prisma migrate deploy')
    // console.log('✅ Migrations complete.') // Removed log
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.env.DATABASE_URL = originalDatabaseUrl // Restore env
    throw error
  } finally {
    // 3. Restore original env variable
    process.env.DATABASE_URL = originalDatabaseUrl
  }

  // 4. Create the test-specific PrismaClient instance
  testPrismaClient = new PrismaClient({
    datasources: { db: { url: testDatabaseUrl } },
  })
  await testPrismaClient.$connect() // Connect it early
  // console.log(`🔌 Connected test PrismaClient instance for schema ${schemaId}`) // Removed log

  // 5. Override Repository registrations in the container
  container.register<IUserRepository>('UserRepository', {
    useValue: new PrismaUserRepository(testPrismaClient),
  })
  container.register<IGymRepository>('GymRepository', {
    useValue: new PrismaGymsRepository(testPrismaClient),
  })
  container.register<ICheckInRepository>('CheckInRepository', {
    useValue: new PrismaCheckInRepository(testPrismaClient), // Pass test client
  })
  // console.log(`🔄 Overrode Repository registrations with test instances.`) // Removed log
})

afterAll(async () => {
  // 1. Disconnect the test client first
  if (testPrismaClient) {
    await testPrismaClient.$disconnect()
    // console.log(`🔌 Disconnected test PrismaClient for schema ${schemaId}`) // Removed log
  }

  // 2. Create a cleanup client connected to the *base* database
  const cleanupPrisma = new PrismaClient({
    datasources: { db: { url: originalDatabaseUrl } }, // Use original URL
  })

  try {
    await cleanupPrisma.$connect()
    // console.log(`🧹 Cleaning up test schema: ${schemaId}`) // Removed log
    await cleanupPrisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`,
    )
    // console.log(`✅ Schema ${schemaId} dropped.`) // Removed log
  } catch (error) {
    console.error(`❌ Failed to drop schema ${schemaId}:`, error)
  } finally {
    await cleanupPrisma.$disconnect()
  }
})
