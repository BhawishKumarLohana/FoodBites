// File: app/api/food/donations/route.js
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

    const donations = await prisma.food.findMany({
      where: {
        DonatedBy: userId,
      },
    });
    console.log(donations);

    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const body = await req.json();
    const { title, quantity, deadline, isDelivery } = body;

    

    const food = await prisma.food.create({
      data: {
        DonatedBy: userId,
        title,
        quantity: quantity,
        deadline: new Date(deadline),
        isDelivery: isDelivery,
        claimId:null,
      },
    });

    return new Response(JSON.stringify(food), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error creating food donation:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}