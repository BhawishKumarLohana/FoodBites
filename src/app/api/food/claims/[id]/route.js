import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(req, { params }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { id } = params;
    const { status } = await req.json();

    // Validate status
    if (!['PENDING', 'COMPLETE'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    // Find the claim and verify ownership
    const claim = await prisma.foodClaim.findUnique({
      where: { claimId: parseInt(id) },
      include: { food: true }
    });

    if (!claim) {
      return new Response(JSON.stringify({ error: 'Claim not found' }), { status: 404 });
    }

    // Verify the user owns this claim
    if (claim.claimedBy !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized to update this claim' }), { status: 403 });
    }

    // Update the claim status
    const updatedClaim = await prisma.foodClaim.update({
      where: { claimId: parseInt(id) },
      data: { status },
      include: {
        food: {
          include: {
            user: true
          }
        }
      }
    });

    return new Response(JSON.stringify(updatedClaim), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating claim:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
} 