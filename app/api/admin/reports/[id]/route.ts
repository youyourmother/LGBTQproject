import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import { updateReportSchema } from '@/lib/validations/report';

// PUT - Update report status
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

    // Check if user is moderator or admin
    if (session.user.role !== 'moderator' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = updateReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report
    report.status = validation.data.status;
    if (validation.data.moderatorNotes) {
      report.moderatorNotes = validation.data.moderatorNotes;
    }

    await report.save();

    return NextResponse.json({
      message: 'Report updated successfully',
      report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

