import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import ical from 'ical-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await dbConnect();

    const event = await Event.findOne({ slug: slug }).lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Create iCal calendar
    const calendar = ical({ name: '+Philia Hub Event' });

    calendar.createEvent({
      start: new Date(event.startsAt),
      end: new Date(event.endsAt),
      summary: event.title,
      description: event.longDescription || event.shortDescription,
      location: event.location.formattedAddress,
      url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
    });

    const icalString = calendar.toString();

    return new NextResponse(icalString, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
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

