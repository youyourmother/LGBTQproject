import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the verification token
    const verificationToken = await VerificationToken.findOne({
      token,
      type: 'email',
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await VerificationToken.deleteOne({ _id: verificationToken._id });
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Find and update the user
    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      // Already verified - delete token and return success
      await VerificationToken.deleteOne({ _id: verificationToken._id });
      return NextResponse.json({
        message: 'Email already verified',
        alreadyVerified: true,
      });
    }

    // Verify the user
    user.emailVerified = new Date();
    await user.save();

    // Delete the verification token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}

