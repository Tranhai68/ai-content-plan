import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    // Extract the file path from DATABASE_URL (format: file:./path/to/db)
    const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
    const dbPath = dbUrl.replace('file:', '')
    const absoluteDbPath = path.resolve(process.cwd(), dbPath)

    const adapter = new PrismaBetterSqlite3({ url: `file:${absoluteDbPath}` })
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
