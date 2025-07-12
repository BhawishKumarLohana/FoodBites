import { PrismaClient } from '@/generated/prisma/client'
const prisma = new PrismaClient();
export async function GET() {
  try {
    const users = await prisma.activityLog.findMany();

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
