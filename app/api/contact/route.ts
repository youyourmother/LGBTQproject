import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactTicket from '@/models/ContactTicket';
import { contactFormSchema } from '@/lib/validations/contact';
import { contactRateLimit } from '@/lib/rate-limit';
import { sendContactNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = contactRateLimit(`contact:${ip}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many contact requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = contactFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    await dbConnect();

    // Create contact ticket
    const ticket = await ContactTicket.create({
      name,
      email,
      subject,
      message,
      status: 'open',
    });

    // Send email notification
    await sendContactNotification({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json({
      message: 'Your message has been sent successfully',
      ticketId: ticket._id,
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

