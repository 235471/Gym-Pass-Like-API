import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { env } from '@/env'

config({ path: '.env', override: true })

const prisma = new PrismaClient()

const schemaId = randomUUID()

function generateUniqueDatabaseUrl(schemaId: string) {
  if (!env.DATABASE_URL)
    throw new Error('Setup DATABASE_URL environment variable')

  const url = new URL(env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

beforeAll(async () => {
  const databaseUrl = generateUniqueDatabaseUrl(schemaId)

  process.env.DATABASE_URL = databaseUrl

  execSync('npx prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
