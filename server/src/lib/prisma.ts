import { PrismaClient } from '@prisma/client';

// 创建全局共享的 PrismaClient 实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 确保连接正常
prisma.$connect().catch((err) => {
  console.error('Prisma连接错误:', err);
});

export default prisma;

