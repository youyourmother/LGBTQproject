import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';
import { sendPasswordResetEmail } from '@/lib/email';
import { authRateLimit } from '@/lib/rate-limit';
import { resetPasswordSchema, newPasswordSchema } from '@/lib/validations/auth';

// Request password reset
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = authRateLimit(`reset-password:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Delete any existing password reset tokens for this email
    await VerificationToken.deleteMany({ email: user.email, type: 'password' });

    // Create password reset token
    const token = nanoid(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await VerificationToken.create({
      email: user.email,
      token,
      type: 'password',
      expires,
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({
      message: 'Password reset link sent. Please check your email.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Set new password
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    const validation = newPasswordSchema.safeParse({ password, confirmPassword });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the reset token
    const resetToken = await VerificationToken.findOne({
      token,
      type: 'password',
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      await VerificationToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: resetToken.email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the reset token
    await VerificationToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}

