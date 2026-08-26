/**
 * Prisma Client singleton — safe for Next.js dev hot-reload and serverless.
 *
 * In development, a single instance is cached on the global object to prevent
 * hot-reload from creating new connections on every file change.
 *
 * In production (serverless / Netlify functions), a new instance is created
 * per cold-start — this is the correct approach for serverless environments.
 *
 * DATABASE_URL must be set as an environment variable (PostgreSQL connection string).
 * Never use NEXT_PUBLIC_DATABASE_URL — the DB URL must remain server-side only.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}