import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { createEventSchema } from '@/lib/validations/event';
import { createEventRateLimit } from '@/lib/rate-limit';
import { checkContent } from '@/lib/content-filter';
import { verifyTurnstile } from '@/lib/turnstile';
import { nanoid } from 'nanoid';

// Helper to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  let slug = baseSlug;
  let counter = 1;

  while (await Event.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// POST - Create a new event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before creating events' },
        { status: 403 }
      );
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = createEventRateLimit(`event:${session.user.id}:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many events created. Please try again later.' },
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

    // Validate input
    const validation = createEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Content filtering
    const titleCheck = checkContent(data.title);
    if (!titleCheck.isClean) {
      return NextResponse.json(
        { error: 'Event title contains inappropriate content' },
        { status: 400 }
      );
    }

    const descCheck = checkContent(data.shortDescription);
    if (!descCheck.isClean) {
      return NextResponse.json(
        { error: 'Event description contains inappropriate content' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique slug
    const slug = await generateUniqueSlug(data.title);

    // Determine organizer
    const organizerType = data.organizerType || 'individual';
    const organizerId = data.organizerId || session.user.id;

    // Create event
    const event = await Event.create({
      title: data.title,
      slug,
      organizerType,
      organizerId,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      timezone: data.timezone,
      location: data.location,
      types: data.types,
      tags: data.tags || [],
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      accessibility: data.accessibility,
      coverImageUrl: data.coverImageUrl,
      capacity: data.capacity,
      rsvpMode: data.rsvpMode,
      rsvpUrl: data.rsvpUrl,
      visibility: data.visibility,
      status: 'active',
      metrics: {
        views: 0,
        rsvps: 0,
        saves: 0,
      },
    });

    return NextResponse.json({
      message: 'Event created successfully',
      slug: event.slug,
      eventId: event._id,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// GET - List events (with search/filter)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const types = searchParams.get('types')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: any = {
      status: 'active',
      visibility: 'public',
    };

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Date filtering
    if (from || to) {
      filter.startsAt = {};
      if (from) filter.startsAt.$gte = new Date(from);
      if (to) filter.startsAt.$lte = new Date(to);
    }

    // Type filtering
    if (types && types.length > 0) {
      filter.types = { $in: types };
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const events = await Event.find(filter)
      .sort({ startsAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Event.countDocuments(filter);

    return NextResponse.json({
      events: JSON.parse(JSON.stringify(events)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

