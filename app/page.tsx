import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/main-layout';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

async function getUpcomingEvents() {
  try {
    await dbConnect();
    
    const events = await Event.find({
      status: 'active',
      visibility: 'public',
      startsAt: { $gte: new Date() },
    })
      .sort({ startsAt: 1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function Home() {
  const events = await getUpcomingEvents();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Find your people.<br />
              <span className="text-primary">Find your power.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground md:text-xl">
              Discover LGBTQ+ events, connect with community, and build the world we want to see.
              Events for us, by us.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/communities">Explore Events</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Hub Is For */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A space for everyone
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              +Philia Hub is built by and for the LGBTQ+ community and allies
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Discover Events</CardTitle>
                <CardDescription>
                  Find pride celebrations, support groups, workshops, social gatherings, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Build Community</CardTitle>
                <CardDescription>
                  Connect with organizations and individuals who share your values and identity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 mb-4">
                  <MapPin className="h-6 w-6 text-info" />
                </div>
                <CardTitle>Stay Safe</CardTitle>
                <CardDescription>
                  Accessibility info, content moderation, and privacy-first design keep our community safe
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Upcoming Events</h2>
              <p className="mt-2 text-muted-foreground">
                Find something that speaks to you
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">View All</Link>
            </Button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No upcoming events yet. Check back soon or{' '}
                  <Link href="/events/create" className="text-primary hover:underline">
                    create your own
                  </Link>
                  !
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <Link key={event._id} href={`/events/${event.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary">
                          {event.types[0]}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
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
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.startsAt), 'EEE, MMM d · h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location.formattedAddress}</span>
                        </div>
                        {event.metrics.rsvps > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{event.metrics.rsvps} going</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join +Philia Hub today and start connecting with your community
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/communities">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
