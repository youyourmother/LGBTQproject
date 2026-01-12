import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import RSVP from '@/models/RSVP';

// GET - Get user's RSVP status for an event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ status: null });
    }

    await dbConnect();

    const event = await Event.findOne({ slug: slug });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const rsvp = await RSVP.findOne({
      eventId: event._id,
      userId: session.user.id,
    });

    return NextResponse.json({ status: rsvp?.status || null });
  } catch (error) {
    console.error('Error fetching RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVP status' },
      { status: 500 }
    );
  }
}

// POST - Create or update RSVP
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
        { error: 'Please verify your email before RSVPing' },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    if (!['going', 'interested'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status' },
        { status: 400 }
      );
    }

    await dbConnect();

    const event = await Event.findOne({ slug: slug });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check capacity if RSVPing as "going"
    if (status === 'going' && event.capacity) {
      const goingCount = await RSVP.countDocuments({
        eventId: event._id,
        status: 'going',
      });

      if (goingCount >= event.capacity) {
        return NextResponse.json(
          { error: 'Event is at capacity' },
          { status: 400 }
        );
      }
    }

    // Create or update RSVP
    const existingRsvp = await RSVP.findOne({
      eventId: event._id,
      userId: session.user.id,
    });

    if (existingRsvp) {
      // Update existing
      const oldStatus = existingRsvp.status;
      existingRsvp.status = status;
      await existingRsvp.save();

      // Update metrics if changing from/to going
      if (oldStatus !== status) {
        if (status === 'going' && oldStatus !== 'going') {
          await Event.updateOne(
            { _id: event._id },
            { $inc: { 'metrics.rsvps': 1 } }
          );
        } else if (oldStatus === 'going' && status !== 'going') {
          await Event.updateOne(
            { _id: event._id },
            { $inc: { 'metrics.rsvps': -1 } }
          );
        }
      }
    } else {
      // Create new
      await RSVP.create({
        eventId: event._id,
        userId: session.user.id,
        status,
      });

      // Increment metrics if going
      if (status === 'going') {
        await Event.updateOne(
          { _id: event._id },
          { $inc: { 'metrics.rsvps': 1 } }
        );
      }
    }

    return NextResponse.json({ status, message: 'RSVP updated successfully' });
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel RSVP
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

    const rsvp = await RSVP.findOne({
      eventId: event._id,
      userId: session.user.id,
    });

    if (!rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    const wasGoing = rsvp.status === 'going';

    await RSVP.deleteOne({ _id: rsvp._id });

    // Decrement metrics if was going
    if (wasGoing) {
      await Event.updateOne(
        { _id: event._id },
        { $inc: { 'metrics.rsvps': -1 } }
      );
    }

    return NextResponse.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    );
  }
}

