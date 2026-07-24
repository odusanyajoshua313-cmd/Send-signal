import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  
  if (databaseUrl.startsWith('postgresql')) {
    return new PrismaClient()
  }
  
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl
  })
  
  return new PrismaClient({ 
    adapter 
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
