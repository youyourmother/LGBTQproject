import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/layout/main-layout';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { format } from 'date-fns';

async function getEvents(searchParams: { q?: string; from?: string; to?: string }) {
  try {
    await dbConnect();
    
    const query: any = {
      status: 'active',
      visibility: 'public',
      startsAt: { $gte: new Date() },
    };

    // Text search
    if (searchParams.q) {
      query.$text = { $search: searchParams.q };
    }

    // Date range filters
    if (searchParams.from) {
      query.startsAt.$gte = new Date(searchParams.from);
    }
    if (searchParams.to) {
      query.startsAt.$lte = new Date(searchParams.to);
    }

    const events = await Event.find(query)
      .sort({ startsAt: 1 })
      .limit(50)
      .lean();

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { q?: string; from?: string; to?: string };
}) {
  const events = await getEvents(searchParams);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">All Events</h1>
            <p className="mt-2 text-muted-foreground">
              Discover LGBTQ+ events happening in your community
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/events/create">Create Event</Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search events..."
                  defaultValue={searchParams.q}
                  className="pl-9"
                />
              </div>
              <Input
                type="date"
                name="from"
                placeholder="From date"
                defaultValue={searchParams.from}
                className="md:w-48"
              />
              <Input
                type="date"
                name="to"
                placeholder="To date"
                defaultValue={searchParams.to}
                className="md:w-48"
              />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No events found. Try adjusting your search or{' '}
                <Link href="/events/create" className="text-primary hover:underline">
                  create a new event
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Found {events.length} event{events.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <Link key={event._id} href={`/events/${event.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    {event.coverImageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap gap-1">
                          {event.types.slice(0, 2).map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                          {format(new Date(event.startsAt), 'MMM d')}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{format(new Date(event.startsAt), 'EEE, MMM d · h:mm a')}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{event.location.formattedAddress}</span>
                        </div>
                        {event.metrics.rsvps > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{event.metrics.rsvps} going</span>
                          </div>
                        )}
                        {(event.accessibility.asl || event.accessibility.stepFree) && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {event.accessibility.asl && (
                              <Badge variant="outline" className="text-xs">
                                ASL
                              </Badge>
                            )}
                            {event.accessibility.stepFree && (
                              <Badge variant="outline" className="text-xs">
                                Step-free
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

