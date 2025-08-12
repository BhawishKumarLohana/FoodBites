import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const claims = await prisma.foodClaim.findMany({
      where: {
        claimedBy: userId,
      },
      include: {
        food: {
          include: {
            user: {
              select: {
                email: true,
                primary_PhoneN: true,
                address: true,
                city: true,
                country: true,
                organization: {
                  select: {
                    orgName: true,
                    type: true,
                    regNumber: true,
                    description: true,
                  }
                },
                restaurant: {
                  select: {
                    ResName: true,
                    openTime: true,
                    closeTime: true,
                    description: true,
                  }
                },
                individualDonor: {
                  select: {
                    fullName: true,
                    idcard: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        claimedAt: 'desc',
      },
    });

    return new Response(JSON.stringify(claims), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
} 