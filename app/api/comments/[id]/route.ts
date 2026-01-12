import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { updateCommentSchema } from '@/lib/validations/comment';
import { checkContent } from '@/lib/content-filter';

// PUT - Update comment (15-minute edit window)
export async function PUT(
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

    const body = await req.json();

    // Validate input
    const validation = updateCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check ownership
    if (comment.authorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    // Check 15-minute edit window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.createdAt < fifteenMinutesAgo) {
      return NextResponse.json(
        { error: 'Edit window has expired (15 minutes)' },
        { status: 403 }
      );
    }

    const { body: newBody } = validation.data;

    // Content filtering
    const contentCheck = checkContent(newBody);
    if (!contentCheck.isClean) {
      return NextResponse.json(
        { error: contentCheck.reason || 'Comment contains inappropriate content' },
        { status: 400 }
      );
    }

    // Update comment
    comment.body = newBody;
    comment.editedAt = new Date();
    await comment.save();

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete comment
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

    await dbConnect();

    const comment = await Comment.findById(id);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check ownership or admin/moderator
    const isOwner = comment.authorId.toString() === session.user.id;
    const isModerator = session.user.role === 'admin' || session.user.role === 'moderator';

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // Soft delete
    comment.status = 'removed';
    await comment.save();

    return NextResponse.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

