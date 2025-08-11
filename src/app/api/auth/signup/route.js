import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Extract common user fields
    const {
      email,
      password,
      address,
      country,
      city,
      primary_PhoneN,
      secondary_PhoneN,
      userType,
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

    // Validate required fields
    if (!email || !password || !address || !country || !city || !primary_PhoneN || !userType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map frontend userType to database UserType enum
    let dbUserType;
    switch (userType) {
      case 'organization':
        dbUserType = 'ORGANIZATION';
        break;
      case 'restaurant':
        dbUserType = 'RESTAURANT';
        break;
      case 'individual':
        dbUserType = 'INDIVIDUAL_DONOR';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid user type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Create user with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          address,
          country,
          city,
          primary_PhoneN,
          secondary_PhoneN,
          type: dbUserType,
        },
      });

      // Create role-specific data
      if (userType === 'organization') {
        if (!orgName || !orgType) {
          throw new Error('Organization name and type are required');
        }
        await tx.organization.create({
          data: {
            userId: user.userId,
            orgName,
            regNumber: regNumber ? parseInt(regNumber) : null,
            description: orgDescription,
            type: orgType,
          },
        });
      } else if (userType === 'restaurant') {
        if (!resName || !openTime || !closeTime) {
          throw new Error('Restaurant name, open time, and close time are required');
        }
        await tx.restaurant.create({
          data: {
            userId: user.userId,
            ResName: resName,
            openTime,
            closeTime,
            description: resDescription,
          },
        });
      } else if (userType === 'individual') {
        if (!fullName) {
          throw new Error('Full name is required');
        }
        await tx.individualDonor.create({
          data: {
            userId: user.userId,
            fullName,
            idcard: idcard || null,
          },
        });
      }

      return user;
    });

    // Determine role for JWT
    let role = 'donor'; // default
    if (userType === 'organization') {
      role = 'claimant';
    }

    // Create JWT payload
    const payload = {
      userId: result.userId,
      email: result.email,
      role: role,
      type: result.type,
      address: result.address,
      city: result.city,
      country: result.country,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return new Response(JSON.stringify({ 
      token,
      user: {
        userId: result.userId,
        email: result.email,
        role: role,
        type: result.type,
        address: result.address,
        city: result.city,
        country: result.country,
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific validation errors
    if (error.message.includes('required')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 