import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ 
  connectionString,
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
const adapter = new PrismaPg(pool)

// Diagnostic check: This will run on server start
console.log("Prisma: Initializing client with adapter...");

const createPrismaClient = () => {
  return new PrismaClient({ 
    adapter,
    log: ['query', 'info', 'warn', 'error']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Log models once to console
if (typeof window === 'undefined') {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log("Prisma: Models available in current client:", models);
}

// Force reload trigger: 2026-05-13 00:08:00