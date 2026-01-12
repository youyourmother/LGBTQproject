import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { sendVerificationEmail } from '@/lib/email';
import { authRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = authRateLimit(`resend-verification:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({
        message: 'If an account exists with this email, a verification email has been sent.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: 'Email is already verified',
      });
    }

    // Delete any existing verification tokens for this email
    await VerificationToken.deleteMany({ email: user.email, type: 'email' });

    // Create new verification token
    const token = nanoid(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await VerificationToken.create({
      email: user.email,
      token,
      type: 'email',
      expires,
    });

    // Send verification email
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending verification email' },
      { status: 500 }
    );
  }
}

