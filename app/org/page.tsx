import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import Event from '@/models/Event';
import User from '@/models/User';
import { Calendar, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';

async function getOrganizations(userId: string) {
  try {
    await dbConnect();

    const user = await User.findById(userId).lean();
    if (!user || !user.orgIds || user.orgIds.length === 0) {
      return [];
    }

    const orgs = await Organization.find({
      _id: { $in: user.orgIds },
    }).lean();

    // Get events for each org
    const orgsWithEvents = await Promise.all(
      orgs.map(async (org) => {
        const events = await Event.find({
          organizerId: org._id,
          organizerType: 'organization',
        })
          .sort({ startsAt: -1 })
          .limit(10)
          .lean();

        const eventCount = await Event.countDocuments({
          organizerId: org._id,
          organizerType: 'organization',
        });

        return {
          ...org,
          events: JSON.parse(JSON.stringify(events)),
          eventCount,
        };
      })
    );

    return JSON.parse(JSON.stringify(orgsWithEvents));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

export default async function OrgPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/org');
  }

  const organizations = await getOrganizations(session.user.id);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                My Organizations
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your organizations and events
              </p>
            </div>
            <Button asChild>
              <Link href="/org/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Link>
            </Button>
          </div>

          {/* Organizations List */}
          {organizations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Organizations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create an organization to manage events and build your community
                </p>
                <Button asChild>
                  <Link href="/org/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Organization
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {organizations.map((org: any) => (
                <Card key={org._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{org.name}</CardTitle>
                          {org.verified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                        </div>
                        {org.description && (
                          <CardDescription>{org.description}</CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{org.members.length} members</span>
                          <span>·</span>
                          <span>{org.eventCount} events</span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/org/${org.slug}`}>Manage</Link>
                      </Button>
                    </div>
                  </CardHeader>

                  {org.events.length > 0 && (
                    <CardContent>
                      <h3 className="font-semibold mb-3">Recent Events</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {org.events.slice(0, 4).map((event: any) => (
                          <Link key={event._id} href={`/events/${event.slug}`}>
                            <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-medium text-sm line-clamp-1">
                                  {event.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {event.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(event.startsAt), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.metrics.rsvps} RSVPs · {event.metrics.views} views
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {org.eventCount > 4 && (
                        <Button asChild variant="link" size="sm" className="mt-3">
                          <Link href={`/org/${org.slug}`}>
                            View all {org.eventCount} events →
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

