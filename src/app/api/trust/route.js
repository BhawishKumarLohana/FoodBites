import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// GET /api/trust - Get trust metrics for a user
export async function GET(req) {
  try {
    console.log('Trust API: Starting request');
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log('Trust API: User ID from params:', userId);

    if (!userId) {
      console.log('Trust API: No user ID provided');
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    console.log('Trust API: Fetching user data for ID:', userId);
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId) },
      select: {
        userId: true,
        email: true,
        phoneVerified: true,
        addressVerified: true,
        trustScore: true,
        totalRatings: true,
        averageRating: true,
        trustLevel: true,
        createdAt: true,
        food: {
          select: {
            foodId: true,
            title: true
          }
        },
        foodClaims: {
          select: {
            claimId: true,
            status: true,
            claimedAt: true
          }
        }
      }
    });

    console.log('Trust API: User data fetched:', user);

    if (!user) {
      console.log('Trust API: User not found');
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Calculate additional metrics
    const totalDonations = user.food.length;
    const totalClaims = user.foodClaims.length;
    
    // For donors: count completed claims on their donations
    let completedClaims = 0;
    if (totalDonations > 0) {
      // Get all claims on user's donations
      const donationClaims = await prisma.foodClaim.findMany({
        where: {
          food: {
            DonatedBy: parseInt(userId)
          }
        },
        select: {
          status: true
        }
      });
      completedClaims = donationClaims.filter(c => c.status === 'COMPLETE').length;
    } else {
      // For claimants: count their own completed claims
      completedClaims = user.foodClaims.filter(c => c.status === 'COMPLETE').length;
    }
    
    const totalRelevantClaims = totalDonations > 0 ? 
      (await prisma.foodClaim.count({
        where: {
          food: {
            DonatedBy: parseInt(userId)
          }
        }
      })) : totalClaims;
    
    const completionRate = totalRelevantClaims > 0 ? (completedClaims / totalRelevantClaims) * 100 : 0;
    
    // Calculate trust score if not already set
    let trustScore = user.trustScore;
    if (!trustScore && user.averageRating) {
      // Formula: (Average Rating * 0.6) + (Completion Rate * 0.4)
      // This gives 60% weight to ratings and 40% to completion rate
      const ratingComponent = (user.averageRating / 5) * 3; // Scale 0-5 to 0-3
      const completionComponent = (completionRate / 100) * 3; // Scale 0-100% to 0-3
      trustScore = Math.round((ratingComponent * 0.6 + completionComponent * 0.4) * 10) / 10;
    }
    
    // Calculate trust level based on trust score
    let trustLevel = user.trustLevel;
    if (trustScore >= 3.0) {
      trustLevel = 'PLATINUM';
    } else if (trustScore >= 2.5) {
      trustLevel = 'GOLD';
    } else if (trustScore >= 2.0) {
      trustLevel = 'SILVER';
    } else {
      trustLevel = 'BRONZE';
    }
    
    // Update user's trust score and level in database if they've changed
    if (trustScore !== user.trustScore || trustLevel !== user.trustLevel) {
      await prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
          trustScore: trustScore,
          trustLevel: trustLevel
        }
      });
    }
    
    console.log('Trust API: Calculated metrics:', {
      totalDonations,
      totalClaims,
      completedClaims,
      totalRelevantClaims,
      completionRate,
      trustScore,
      trustLevel
    });
    
    // Get recent ratings
    console.log('Trust API: Fetching recent ratings');
    const recentRatings = await prisma.rating.findMany({
      where: { ratedUserId: parseInt(userId) },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        rater: {
          select: { email: true }
        }
      }
    });

    console.log('Trust API: Recent ratings fetched:', recentRatings);

    const trustMetrics = {
      ...user,
      totalDonations,
      totalClaims,
      completedClaims,
      completionRate: Math.round(completionRate * 100) / 100,
      trustScore: trustScore,
      trustLevel: trustLevel,
      recentRatings
    };

    console.log('Trust API: Final trust metrics:', trustMetrics);

    return new Response(JSON.stringify(trustMetrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Trust API: Error details:', error);
    console.error('Trust API: Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { status: 500 });
  }
}

// PUT /api/trust - Update verification status
export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { phoneVerified, addressVerified } = await req.json();

    // Only allow users to update their own verification status
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Update verification status
    const updatedUser = await prisma.user.update({
      where: { userId: parseInt(userId) },
      data: {
        phoneVerified: phoneVerified !== undefined ? phoneVerified : user.phoneVerified,
        addressVerified: addressVerified !== undefined ? addressVerified : user.addressVerified
      },
      select: {
        phoneVerified: true,
        addressVerified: true
      }
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating verification status:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
} 