import { PrismaClient } from '@/generated/prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

// GET /api/activity - Get activity logs
export async function GET(request) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    const where = {};
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;

    // Get activity logs with user information
    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            type: true,
            organization: {
              select: {
                orgName: true,
              },
            },
            restaurant: {
              select: {
                ResName: true,
              },
            },
            individualDonor: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.activityLog.count({ where });

    return new Response(JSON.stringify({
      activityLogs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GET activity error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/activity - Create activity log entry
export async function POST(request) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { action, targetId } = await request.json();

    // Validate required fields
    if (!action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate action type
    const validActions = [
      'CREATE_FOOD',
      'UPDATE_FOOD', 
      'DELETE_FOOD',
      'CLAIM_FOOD',
      'CANCEL_CLAIM',
      'UPDATE_PROFILE',
      'LOGIN',
      'SIGNUP',
    ];

    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid action type',
        validActions 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId: user.userId },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create activity log entry
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action,
        targetId: targetId || null,
        timestamp: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            type: true,
            organization: {
              select: {
                orgName: true,
              },
            },
            restaurant: {
              select: {
                ResName: true,
              },
            },
            individualDonor: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify(activityLog), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('POST activity error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
