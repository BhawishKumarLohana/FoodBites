// app/lib/prisma.js
import { PrismaClient } from '@/generated/prisma'
let prisma;

if (global.prisma) {
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
}

export { prisma };

