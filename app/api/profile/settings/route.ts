import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { updateProfileSchema } from '@/lib/validations/auth';

// GET - Get user settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      displayName: user.displayName,
      pronouns: user.pronouns,
      settings: user.settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (validation.data.displayName !== undefined) {
      user.displayName = validation.data.displayName;
    }
    if (validation.data.pronouns !== undefined) {
      user.pronouns = validation.data.pronouns;
    }
    if (validation.data.settings) {
      user.settings = {
        ...user.settings,
        ...validation.data.settings,
      };
      // Mark nested object as modified so Mongoose saves it
      user.markModified('settings');
      console.log('Updating settings:', user.settings);
    }

    await user.save();
    console.log('User saved successfully with settings:', user.settings);

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        displayName: user.displayName,
        pronouns: user.pronouns,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

