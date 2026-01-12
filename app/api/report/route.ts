import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import { createReportSchema } from '@/lib/validations/report';
import { reportRateLimit } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = reportRateLimit(`report:${session.user.id}`);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many reports. Please wait before submitting another.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = createReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { targetType, targetId, reason } = validation.data;

    await dbConnect();

    // Check for duplicate report (same user, same target)
    const existingReport = await Report.findOne({
      reporterId: session.user.id,
      targetType,
      targetId,
      status: 'open',
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 400 }
      );
    }

    // Create report
    const report = await Report.create({
      targetType,
      targetId,
      reporterId: session.user.id,
      reason,
      status: 'open',
    });

    // Send email notification to support
    try {
      await sendEmail({
        to: process.env.SUPPORT_INBOX || 'yuyourmother@gmail.com',
        subject: `New Report: ${targetType} (${targetId})`,
        html: `
          <h2>New Content Report</h2>
          <p><strong>Type:</strong> ${targetType}</p>
          <p><strong>Target ID:</strong> ${targetId}</p>
          <p><strong>Reporter:</strong> ${session.user.email}</p>
          <p><strong>Reason:</strong></p>
          <p>${reason.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Report ID: ${report._id}</small></p>
        `,
      });
    } catch (emailError) {
      console.error('Error sending report notification email:', emailError);
      // Don't fail the report if email fails
    }

    return NextResponse.json({
      message: 'Report submitted successfully',
      reportId: report._id,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

