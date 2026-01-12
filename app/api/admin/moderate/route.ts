import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

// POST - Moderate content (flag, remove, restore)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is moderator or admin
    if (session.user.role !== 'moderator' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { targetType, targetId, action } = await req.json();

    if (!['event', 'comment'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      );
    }

    if (!['flag', 'remove', 'restore'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return NextResponse.json(
        { error: 'Invalid target ID' },
        { status: 400 }
      );
    }

    await dbConnect();

    let target;
    if (targetType === 'event') {
      target = await Event.findById(targetId);
    } else {
      target = await Comment.findById(targetId);
    }

    if (!target) {
      return NextResponse.json(
        { error: `${targetType} not found` },
        { status: 404 }
      );
    }

    // Apply action
    switch (action) {
      case 'flag':
        target.status = 'flagged';
        break;
      case 'remove':
        target.status = 'removed';
        break;
      case 'restore':
        target.status = targetType === 'event' ? 'active' : 'visible';
        break;
    }

    await target.save();

    return NextResponse.json({
      message: `${targetType} ${action}ed successfully`,
      status: target.status,
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    return NextResponse.json(
      { error: 'Failed to moderate content' },
      { status: 500 }
    );
  }
}

