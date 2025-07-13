import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
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
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET /api/users/[id] - Get specific user profile
export async function GET(request, context) {
  const awaitedParams = await context.params;
  try {
    const userId = parseInt(awaitedParams.id);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Users can only view their own profile
    if (user.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user with role-specific data
    const userData = await prisma.user.findUnique({
      where: { userId },
      include: {
        organization: true,
        restaurant: true,
        individualDonor: true,
      },
    });

    if (!userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Remove sensitive data
    const { password, ...safeUserData } = userData;

    return new Response(JSON.stringify(safeUserData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GET user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request, context) {
  const awaitedParams = await context.params;
  try {
    const userId = parseInt(awaitedParams.id);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Users can only update their own profile
    if (user.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();
    
    // Extract updateable fields
    const {
      email,
      password,
      address,
      country,
      city,
      primary_PhoneN,
      secondary_PhoneN,
      // Organization fields
      orgName,
      regNumber,
      orgDescription,
      orgType,
      // Restaurant fields
      resName,
      openTime,
      closeTime,
      resDescription,
      // Individual Donor fields
      fullName,
      idcard,
    } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId },
      include: {
        organization: true,
        restaurant: true,
        individualDonor: true,
      },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return new Response(JSON.stringify({ error: 'Email already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Update user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Prepare user update data
      const userUpdateData = {};
      if (email) userUpdateData.email = email;
      if (password) userUpdateData.password = await bcrypt.hash(password, 10);
      if (address) userUpdateData.address = address;
      if (country) userUpdateData.country = country;
      if (city) userUpdateData.city = city;
      if (primary_PhoneN) userUpdateData.primary_PhoneN = primary_PhoneN;
      if (secondary_PhoneN !== undefined) userUpdateData.secondary_PhoneN = secondary_PhoneN;

      // Update base user
      const updatedUser = await tx.user.update({
        where: { userId },
        data: userUpdateData,
      });

      // Update role-specific data
      if (existingUser.type === 'ORGANIZATION' && existingUser.organization) {
        const orgUpdateData = {};
        if (orgName) orgUpdateData.orgName = orgName;
        if (regNumber !== undefined) orgUpdateData.regNumber = regNumber ? parseInt(regNumber) : null;
        if (orgDescription !== undefined) orgUpdateData.description = orgDescription;
        if (orgType) orgUpdateData.type = orgType;

        if (Object.keys(orgUpdateData).length > 0) {
          await tx.organization.update({
            where: { userId },
            data: orgUpdateData,
          });
        }
      } else if (existingUser.type === 'RESTAURANT' && existingUser.restaurant) {
        const resUpdateData = {};
        if (resName) resUpdateData.ResName = resName;
        if (openTime) resUpdateData.openTime = openTime;
        if (closeTime) resUpdateData.closeTime = closeTime;
        if (resDescription !== undefined) resUpdateData.description = resDescription;

        if (Object.keys(resUpdateData).length > 0) {
          await tx.restaurant.update({
            where: { userId },
            data: resUpdateData,
          });
        }
      } else if (existingUser.type === 'INDIVIDUAL_DONOR' && existingUser.individualDonor) {
        const indUpdateData = {};
        if (fullName) indUpdateData.fullName = fullName;
        if (idcard !== undefined) indUpdateData.idcard = idcard;

        if (Object.keys(indUpdateData).length > 0) {
          await tx.individualDonor.update({
            where: { userId },
            data: indUpdateData,
          });
        }
      }

      return updatedUser;
    });

    // Get updated user data
    const updatedUserData = await prisma.user.findUnique({
      where: { userId },
      include: {
        organization: true,
        restaurant: true,
        individualDonor: true,
      },
    });

    // Remove sensitive data
    const { password: _, ...safeUserData } = updatedUserData;

    return new Response(JSON.stringify(safeUserData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PUT user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE /api/users/[id] - Delete user account
export async function DELETE(request, context) {
  const awaitedParams = await context.params;
  try {
    const userId = parseInt(awaitedParams.id);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Users can only delete their own account
    if (user.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete user with transaction (cascading deletes will handle related data)
    await prisma.$transaction(async (tx) => {
      // Delete role-specific data first
      if (existingUser.type === 'ORGANIZATION') {
        await tx.organization.deleteMany({
          where: { userId },
        });
      } else if (existingUser.type === 'RESTAURANT') {
        await tx.restaurant.deleteMany({
          where: { userId },
        });
      } else if (existingUser.type === 'INDIVIDUAL_DONOR') {
        await tx.individualDonor.deleteMany({
          where: { userId },
        });
      }

      // Delete activity logs
      await tx.activityLog.deleteMany({
        where: { userId },
      });

      // Delete the user
      await tx.user.delete({
        where: { userId },
      });
    });

    return new Response(JSON.stringify({ message: 'User account deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('DELETE user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 