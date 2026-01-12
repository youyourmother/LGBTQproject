import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/layout/main-layout';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { Calendar, MapPin, Users, Search, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const EVENT_TYPES = ['social', 'support', 'education', 'celebration', 'entertainment', 'community'];
const EVENT_TAGS = ['pride', 'trans', 'youth', 'support', 'party', 'workshop', 'books', 'art', 'sports'];

async function searchEvents(params: {
  q?: string;
  types?: string[];
  tags?: string[];
  from?: string;
  to?: string;
}) {
  try {
    await dbConnect();

    const query: any = {
      status: 'active',
      visibility: 'public',
      startsAt: { $gte: new Date() },
    };

    // Text search
    if (params.q) {
      query.$text = { $search: params.q };
    }

    // Type filter
    if (params.types && params.types.length > 0) {
      query.types = { $in: params.types };
    }

    // Tag filter
    if (params.tags && params.tags.length > 0) {
      query.tags = { $in: params.tags };
    }

    // Date range
    if (params.from) {
      query.startsAt.$gte = new Date(params.from);
    }
    if (params.to) {
      query.startsAt = { ...query.startsAt, $lte: new Date(params.to) };
    }

    const events = await Event.find(query)
      .sort({ startsAt: 1 })
      .limit(50)
      .lean();

    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    types?: string;
    tags?: string;
    from?: string;
    to?: string;
  };
}) {
  const selectedTypes = searchParams.types?.split(',').filter(Boolean) || [];
  const selectedTags = searchParams.tags?.split(',').filter(Boolean) || [];

  const events = await searchEvents({
    q: searchParams.q,
    types: selectedTypes,
    tags: selectedTags,
    from: searchParams.from,
    to: searchParams.to,
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Explore Communities
          </h1>
          <p className="text-muted-foreground">
            Discover LGBTQ+ events and communities in your area
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search</Label>
                  <form method="get" className="mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        name="q"
                        placeholder="Search events..."
                        defaultValue={searchParams.q}
                        className="pl-9"
                      />
                    </div>
                    <input type="hidden" name="types" value={selectedTypes.join(',')} />
                    <input type="hidden" name="tags" value={selectedTags.join(',')} />
                    <input type="hidden" name="from" value={searchParams.from} />
                    <input type="hidden" name="to" value={searchParams.to} />
                    <Button type="submit" className="w-full mt-2" size="sm">
                      Apply
                    </Button>
                  </form>
                </div>

                {/* Event Types */}
                <div>
                  <Label className="mb-3 block">Event Types</Label>
                  <form method="get">
                    <input type="hidden" name="q" value={searchParams.q} />
                    <input type="hidden" name="from" value={searchParams.from} />
                    <input type="hidden" name="to" value={searchParams.to} />
                    <input type="hidden" name="tags" value={selectedTags.join(',')} />
                    <div className="space-y-2">
                      {EVENT_TYPES.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            name="types"
                            value={type}
                            defaultChecked={selectedTypes.includes(type)}
                          />
                          <Label
                            htmlFor={`type-${type}`}
                            className="text-sm font-normal cursor-pointer capitalize"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Button type="submit" className="w-full mt-3" size="sm" variant="outline">
                      Apply Filters
                    </Button>
                  </form>
                </div>

                {/* Tags */}
                <div>
                  <Label className="mb-3 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      const newTags = isSelected
                        ? selectedTags.filter((t) => t !== tag)
                        : [...selectedTags, tag];

                      return (
                        <Link
                          key={tag}
                          href={`/communities?${new URLSearchParams({
                            ...(searchParams.q && { q: searchParams.q }),
                            ...(searchParams.from && { from: searchParams.from }),
                            ...(searchParams.to && { to: searchParams.to }),
                            types: selectedTypes.join(','),
                            tags: newTags.join(','),
                          }).toString()}`}
                        >
                          <Badge
                            variant={isSelected ? 'default' : 'outline'}
                            className="cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="mb-3 block">Date Range</Label>
                  <form method="get" className="space-y-2">
                    <input type="hidden" name="q" value={searchParams.q} />
                    <input type="hidden" name="types" value={selectedTypes.join(',')} />
                    <input type="hidden" name="tags" value={selectedTags.join(',')} />
                    <div>
                      <Label htmlFor="from" className="text-xs text-muted-foreground">
                        From
                      </Label>
                      <Input
                        id="from"
                        name="from"
                        type="date"
                        defaultValue={searchParams.from}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="to" className="text-xs text-muted-foreground">
                        To
                      </Label>
                      <Input
                        id="to"
                        name="to"
                        type="date"
                        defaultValue={searchParams.to}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full" size="sm">
                      Apply
                    </Button>
                  </form>
                </div>

                {/* Clear Filters */}
                {(selectedTypes.length > 0 ||
                  selectedTags.length > 0 ||
                  searchParams.q ||
                  searchParams.from ||
                  searchParams.to) && (
                  <div>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href="/communities">Clear All Filters</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </p>
              <Button asChild size="sm">
                <Link href="/events/create">Create Event</Link>
              </Button>
            </div>

            {events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No events found matching your filters.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/communities">Clear Filters</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
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
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {event.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
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
        </div>
      </div>
    </MainLayout>
  );
}

