import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Organization from '@/models/Organization';
import { updateEventSchema } from '@/lib/validations/event';
import { checkContent } from '@/lib/content-filter';

// GET - Get event by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const event = await Event.findOne({ slug: slug, status: { $ne: 'removed' } }).lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch organizer details
    let organizer = null;
    if (event.organizerType === 'organization') {
      organizer = await Organization.findById(event.organizerId).lean();
    }

    return NextResponse.json({
      event: JSON.parse(JSON.stringify(event)),
      organizer: organizer ? JSON.parse(JSON.stringify(organizer)) : null,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(
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

    const body = await req.json();

    // Validate input
    const validation = updateEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const event = await Event.findOne({ slug: slug });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check ownership or admin/moderator
    const isOwner = event.organizerId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin' || session.user.role === 'moderator';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this event' },
        { status: 403 }
      );
    }

    const data = validation.data;

    // Content filtering if title or description changed
    if (data.title) {
      const titleCheck = checkContent(data.title);
      if (!titleCheck.isClean) {
        return NextResponse.json(
          { error: 'Event title contains inappropriate content' },
          { status: 400 }
        );
      }
    }

    if (data.shortDescription) {
      const descCheck = checkContent(data.shortDescription);
      if (!descCheck.isClean) {
        return NextResponse.json(
          { error: 'Event description contains inappropriate content' },
          { status: 400 }
        );
      }
    }

    // Update event
    Object.assign(event, {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : event.startsAt,
      endsAt: data.endsAt ? new Date(data.endsAt) : event.endsAt,
    });

    await event.save();

    return NextResponse.json({
      message: 'Event updated successfully',
      slug: event.slug,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete event
export async function DELETE(
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

    await dbConnect();

    const event = await Event.findOne({ slug: slug });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = event.organizerId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this event' },
        { status: 403 }
      );
    }

    // Soft delete
    event.status = 'removed';
    await event.save();

    return NextResponse.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

