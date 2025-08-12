import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/ratings - Create a new rating
export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const raterId = decoded.userId;

    const { ratedUserId, rating, comment, claimId } = await req.json();

    // Validate rating (1-5 stars)
    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), { status: 400 });
    }

    // Prevent self-rating
    if (raterId === ratedUserId) {
      return new Response(JSON.stringify({ error: 'Cannot rate yourself' }), { status: 400 });
    }

    // Check if user already rated this person for this claim
    const existingRating = await prisma.rating.findUnique({
      where: {
        raterId_ratedUserId_claimId: {
          raterId,
          ratedUserId,
          claimId: claimId || null
        }
      }
    });

    if (existingRating) {
      return new Response(JSON.stringify({ error: 'Already rated this user for this claim' }), { status: 400 });
    }

    // Create the rating
    const newRating = await prisma.rating.create({
      data: {
        rating,
        comment,
        raterId,
        ratedUserId,
        claimId
      },
      include: {
        rater: {
          select: {
            email: true
          }
        },
        ratedUser: {
          select: {
            email: true
          }
        }
      }
    });

    // Update the rated user's trust metrics
    await updateUserTrustMetrics(ratedUserId);

    return new Response(JSON.stringify(newRating), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating rating:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

// GET /api/ratings - Get ratings for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const ratings = await prisma.rating.findMany({
      where: {
        ratedUserId: parseInt(userId)
      },
      include: {
        rater: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify(ratings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

// Helper function to update user trust metrics
async function updateUserTrustMetrics(userId) {
  try {
    // Get all ratings for the user
    const ratings = await prisma.rating.findMany({
      where: { ratedUserId: userId }
    });

    if (ratings.length === 0) return;

    // Calculate new metrics
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    // Calculate trust score (weighted average of rating and activity)
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        food: true,
        foodClaims: true
      }
    });

    const totalDonations = user.food.length;
    const totalClaims = user.foodClaims.length;
    const completedClaims = user.foodClaims.filter(c => c.status === 'COMPLETE').length;
    
    // Trust score formula: (avgRating * 0.6) + (completionRate * 0.4)
    const completionRate = totalClaims > 0 ? completedClaims / totalClaims : 0;
    const trustScore = (averageRating * 0.6) + (completionRate * 0.4);

    // Determine trust level
    let trustLevel = 'BRONZE';
    if (trustScore >= 4.5) trustLevel = 'PLATINUM';
    else if (trustScore >= 4.0) trustLevel = 'GOLD';
    else if (trustScore >= 3.5) trustLevel = 'SILVER';

    // Update user
    await prisma.user.update({
      where: { userId },
      data: {
        trustScore: Math.round(trustScore * 100) / 100,
        totalRatings,
        averageRating: Math.round(averageRating * 100) / 100,
        trustLevel
      }
    });

  } catch (error) {
    console.error('Error updating trust metrics:', error);
  }
} 