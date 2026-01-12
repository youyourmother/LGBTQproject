'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    openReports: 0,
    flaggedEvents: 0,
    flaggedComments: 0,
    totalUsers: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
      return;
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'admin' && session.user.role !== 'moderator') {
        router.push('/');
        return;
      }

      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentReports(data.recentReports);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'reviewed' | 'dismissed') => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      await fetchStats(); // Refresh stats
    } catch (error) {
      alert('Failed to update report');
    }
  };

  const handleModerateContent = async (targetType: string, targetId: string, action: 'flag' | 'remove' | 'restore') => {
    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to moderate content');
      }

      await fetchStats(); // Refresh stats
    } catch (error) {
      alert('Failed to moderate content');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          Loading...
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Moderation Dashboard
            </h1>
            <p className="text-muted-foreground">
              Review reports and manage community content
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openReports}</div>
                <p className="text-xs text-muted-foreground">Require review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.flaggedEvents}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.flaggedComments}</div>
                <p className="text-xs text-muted-foreground">Pending review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Latest reports from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No open reports. Great job keeping the community safe! 🎉
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report: any) => (
                    <div
                      key={report._id}
                      className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            {report.targetType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Reporter:</span> {report.reporterId.name} ({report.reporterId.email})
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target ID: {report.targetId}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleReportAction(report._id, 'reviewed')}
                        >
                          Mark Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerateContent(report.targetType, report.targetId, 'flag')}
                        >
                          Flag Content
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Remove this content?')) {
                              handleModerateContent(report.targetType, report.targetId, 'remove');
                            }
                          }}
                        >
                          Remove Content
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReportAction(report._id, 'dismissed')}
                        >
                          Dismiss Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
}

