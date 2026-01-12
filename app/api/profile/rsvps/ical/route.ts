import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import RSVP from '@/models/RSVP';
import Event from '@/models/Event';
import ical from 'ical-generator';

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

    // Get all user's RSVPs with event details
    const rsvps = await RSVP.find({
      userId: session.user.id,
      status: { $in: ['going', 'interested'] },
    }).populate('eventId').lean();

    if (rsvps.length === 0) {
      return NextResponse.json(
        { error: 'No RSVPs found' },
        { status: 404 }
      );
    }

    // Create iCal calendar
    const calendar = ical({ name: 'My +Philia Hub Events' });

    for (const rsvp of rsvps) {
      const event = rsvp.eventId as any;
      
      if (!event || !event.startsAt) continue;

      calendar.createEvent({
        start: new Date(event.startsAt),
        end: new Date(event.endsAt),
        summary: event.title,
        description: event.longDescription || event.shortDescription,
        location: event.location.formattedAddress,
        url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
      });
    }

    const icalString = calendar.toString();

    return new NextResponse(icalString, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-events.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating iCal:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    );
  }
}

