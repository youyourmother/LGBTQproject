import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dbConnect from '@/lib/mongodb';
import RSVP from '@/models/RSVP';
import Event from '@/models/Event';
import { Calendar, MapPin, Download } from 'lucide-react';
import { format } from 'date-fns';

async function getUserRSVPs(userId: string) {
  try {
    await dbConnect();

    const rsvps = await RSVP.find({
      userId,
      status: { $in: ['going', 'interested'] },
    })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .lean();

    // Separate upcoming and past
    const now = new Date();
    const upcoming = rsvps.filter(
      (rsvp: any) => rsvp.eventId && new Date(rsvp.eventId.startsAt) >= now
    );
    const past = rsvps.filter(
      (rsvp: any) => rsvp.eventId && new Date(rsvp.eventId.startsAt) < now
    );

    return {
      upcoming: JSON.parse(JSON.stringify(upcoming)),
      past: JSON.parse(JSON.stringify(past)),
    };
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return { upcoming: [], past: [] };
  }
}

async function getUserEvents(userId: string) {
  try {
    await dbConnect();

    const events = await Event.find({
      organizerId: userId,
      organizerType: 'individual',
    })
      .sort({ startsAt: -1 })
      .limit(20)
      .lean();

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  const { upcoming, past } = await getUserRSVPs(session.user.id);
  const userEvents = await getUserEvents(session.user.id);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  My Profile
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{session.user.name}</span>
                  {session.user.pronouns && <span>· {session.user.pronouns}</span>}
                  <span>· {session.user.email}</span>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/profile/settings">Settings</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="rsvps" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rsvps">My RSVPs</TabsTrigger>
              <TabsTrigger value="events">My Events</TabsTrigger>
            </TabsList>

            {/* RSVPs Tab */}
            <TabsContent value="rsvps" className="mt-6 space-y-6">
              {/* Upcoming RSVPs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Upcoming Events</h2>
                  {upcoming.length > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/api/profile/rsvps/ical">
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                      </Link>
                    </Button>
                  )}
                </div>

                {upcoming.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">
                        You haven't RSVP'd to any upcoming events yet.
                      </p>
                      <Button asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcoming.map((rsvp: any) => (
                      <Link key={rsvp._id} href={`/events/${rsvp.eventId.slug}`}>
                        <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant={rsvp.status === 'going' ? 'default' : 'secondary'}>
                                {rsvp.status === 'going' ? 'Going' : 'Interested'}
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(rsvp.eventId.startsAt), 'MMM d')}
                              </div>
                            </div>
                            <CardTitle className="line-clamp-2">{rsvp.eventId.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {rsvp.eventId.shortDescription}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {format(new Date(rsvp.eventId.startsAt), 'EEE, MMM d · h:mm a')}
                                </span>
                              </div>
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">
                                  {rsvp.eventId.location.formattedAddress}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Past RSVPs */}
              {past.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Past Events</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {past.slice(0, 6).map((rsvp: any) => (
                      <Link key={rsvp._id} href={`/events/${rsvp.eventId.slug}`}>
                        <Card className="opacity-75 hover:opacity-100 transition-opacity">
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{rsvp.eventId.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {format(new Date(rsvp.eventId.startsAt), 'MMM d, yyyy')}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* My Events Tab */}
            <TabsContent value="events" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Events I've Created</h2>
                <Button asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>

              {userEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any events yet.
                    </p>
                    <Button asChild>
                      <Link href="/events/create">Create Your First Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {userEvents.map((event: any) => (
                    <Link key={event._id} href={`/events/${event.slug}`}>
                      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="secondary">{event.types[0]}</Badge>
                            <Badge variant={event.status === 'active' ? 'default' : 'outline'}>
                              {event.status}
                            </Badge>
                          </div>
                          <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.shortDescription}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(event.startsAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="text-muted-foreground">
                              {event.metrics.rsvps} RSVPs · {event.metrics.views} views
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

