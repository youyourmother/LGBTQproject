import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Reaction from '@/models/Reaction';
import Comment from '@/models/Comment';

const ALLOWED_EMOJIS = ['❤️', '👍', '🎉', '😊', '🏳️‍🌈', '🏳️‍⚧️', '💪', '🙌'];

// POST - Add reaction to comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { emoji } = await req.json();

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: 'Invalid emoji' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if comment exists
    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Create or update reaction (upsert)
    const existingReaction = await Reaction.findOne({
      commentId: id,
      userId: session.user.id,
      emoji,
    });

    if (existingReaction) {
      return NextResponse.json({
        message: 'Reaction already exists',
        reaction: existingReaction,
      });
    }

    const reaction = await Reaction.create({
      commentId: id,
      userId: session.user.id,
      emoji,
    });

    return NextResponse.json({
      message: 'Reaction added successfully',
      reaction,
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        message: 'Reaction already exists',
      });
    }

    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE - Remove reaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji parameter required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Reaction.deleteOne({
      commentId: id,
      userId: session.user.id,
      emoji,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Reaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}

// GET - Get reactions for a comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const reactions = await Reaction.find({ commentId: id })
      .populate('userId', 'name displayName')
      .lean();

    // Group by emoji
    const grouped = reactions.reduce((acc: any, reaction: any) => {
      const emoji = reaction.emoji;
      if (!acc[emoji]) {
        acc[emoji] = {
          emoji,
          count: 0,
          users: [],
          userReacted: false,
        };
      }
      acc[emoji].count++;
      acc[emoji].users.push(reaction.userId);
      return acc;
    }, {});

    return NextResponse.json({
      reactions: Object.values(grouped),
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

