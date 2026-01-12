import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { commentRateLimit } from '@/lib/rate-limit';
import { checkContent } from '@/lib/content-filter';
import { verifyTurnstile } from '@/lib/turnstile';
import { createCommentSchema } from '@/lib/validations/comment';

// GET - Fetch comments for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const event = await Event.findOne({ slug: slug });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch top-level comments
    const topLevelComments = await Comment.find({
      eventId: event._id,
      parentId: null,
      status: 'visible',
    })
      .populate('authorId', 'name displayName avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await Comment.find({
          parentId: comment._id,
          status: 'visible',
        })
          .populate('authorId', 'name displayName avatarUrl')
          .sort({ createdAt: 1 })
          .lean();

        return {
          ...comment,
          replies,
        };
      })
    );

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before commenting' },
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = commentRateLimit(`comment:${session.user.id}:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many comments. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Verify Turnstile token
    if (process.env.TURNSTILE_SECRET_KEY) {
      const { turnstileToken } = body;
      const isValidTurnstile = await verifyTurnstile(turnstileToken);
      
      if (!isValidTurnstile) {
        return NextResponse.json(
          { error: 'Invalid security verification. Please try again.' },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const event = await Event.findOne({ slug: slug });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Validate input
    const validation = createCommentSchema.safeParse({
      ...body,
      eventId: (event._id as any).toString(),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { body: commentBody, parentId } = validation.data;

    // Content filtering
    const contentCheck = checkContent(commentBody);
    if (!contentCheck.isClean) {
      return NextResponse.json(
        { error: contentCheck.reason || 'Comment contains inappropriate content' },
        { status: 400 }
      );
    }

    // If replying, check parent comment exists and depth
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      if (parentComment.parentId) {
        return NextResponse.json(
          { error: 'Maximum comment depth reached (2 levels)' },
          { status: 400 }
        );
      }
    }

    // Create comment
    const comment = await Comment.create({
      eventId: event._id,
      authorId: session.user.id,
      parentId: parentId || null,
      body: commentBody,
      status: 'visible',
    });

    // Populate author info
    await comment.populate('authorId', 'name displayName avatarUrl');

    return NextResponse.json({
      comment,
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

