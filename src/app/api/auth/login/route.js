import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        restaurant: true,
        individualDonor: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine user role based on type and related data
    let role = 'donor'; // default
    if (user.type === 'ORGANIZATION') {
      role = 'claimant';
    } else if (user.type === 'RESTAURANT' || user.type === 'INDIVIDUAL_DONOR') {
      role = 'donor';
    }

    // Create JWT payload
    const payload = {
      userId: user.userId,
      email: user.email,
      role: role,
      type: user.type,
      address: user.address,
      city: user.city,
      country: user.country,
    };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return new Response(JSON.stringify({ 
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: role,
        type: user.type,
        address: user.address,
        city: user.city,
        country: user.country,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 