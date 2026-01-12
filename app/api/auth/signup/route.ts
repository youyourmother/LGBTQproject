import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { signUpSchema } from '@/lib/validations/auth';
import { sendVerificationEmail } from '@/lib/email';
import { authRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = authRateLimit(`signup:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, pronouns } = validation.data;

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      pronouns,
      role: 'member',
      settings: {
        emailOptIn: true,
        profileVisibility: 'public',
      },
    });

    // Create verification token
    const token = nanoid(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await VerificationToken.create({
      email: user.email,
      token,
      type: 'email',
      expires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created
    }

    return NextResponse.json({
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: user._id,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        error: 'An error occurred during signup',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

