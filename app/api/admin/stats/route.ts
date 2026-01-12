import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import Report from '@/models/Report';
import Event from '@/models/Event';
import Comment from '@/models/Comment';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator
    if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const [openReports, flaggedEvents, flaggedComments, totalUsers] = await Promise.all([
      Report.countDocuments({ status: 'open' }),
      Event.countDocuments({ status: 'flagged' }),
      Comment.countDocuments({ status: 'flagged' }),
      User.countDocuments({}),
    ]);

    const recentReports = await Report.find({ status: 'open' })
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      stats: {
        openReports,
        flaggedEvents,
        flaggedComments,
        totalUsers,
      },
      recentReports: JSON.parse(JSON.stringify(recentReports)),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

