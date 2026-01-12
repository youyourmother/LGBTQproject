import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/components/layout/main-layout';
import RsvpButton from '@/components/events/rsvp-button';
import CommentSection from '@/components/comments/comment-section';
import ReportDialog from '@/components/moderation/report-dialog';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Calendar, MapPin, Users, ExternalLink, Share2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateDirectionsUrl } from '@/lib/google-maps';

async function getEvent(slug: string) {
  try {
    await dbConnect();
    
    const event = await Event.findOne({ slug, status: { $ne: 'removed' } }).lean();
    
    if (!event) {
      return null;
    }

    // Fetch organizer details
    let organizer = null;
    if (event.organizerType === 'organization') {
      organizer = await Organization.findById(event.organizerId).lean();
    } else {
      organizer = await User.findById(event.organizerId).select('name displayName').lean();
    }

    return {
      event: JSON.parse(JSON.stringify(event)),
      organizer: JSON.parse(JSON.stringify(organizer)),
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getEvent(slug);
  const session = await getServerSession(authOptions);

  if (!data) {
    notFound();
  }

  const { event, organizer } = data;
  const directionsUrl = generateDirectionsUrl(event.location.placeId);
  
  const isOwner = session?.user?.id === event.organizerId.toString();
  const canEdit = isOwner || session?.user?.role === 'admin' || session?.user?.role === 'moderator';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Cover Image */}
          {event.coverImageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <img
                src={event.coverImageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.types.map((type: string) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
              {event.visibility === 'unlisted' && (
                <Badge variant="outline">Unlisted</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              {event.title}
            </h1>

            <div className="flex items-center gap-2 text-muted-foreground">
              <span>By</span>
              <span className="font-medium text-foreground">
                {organizer?.name || organizer?.displayName || 'Unknown'}
              </span>
              {event.organizerType === 'organization' && organizer?.verified && (
                <Badge variant="default" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(event.startsAt), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.startsAt), 'h:mm a')} - {format(new Date(event.endsAt), 'h:mm a')}
                        {' '}({event.timezone})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{event.location.formattedAddress}</div>
                      {event.location.roomNotes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.location.roomNotes}
                        </div>
                      )}
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Get directions
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {event.metrics.rsvps > 0 && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <span className="font-medium">{event.metrics.rsvps} people</span>
                        <span className="text-muted-foreground"> going</span>
                        {event.capacity && (
                          <span className="text-sm text-muted-foreground">
                            {' '}· {event.capacity} max capacity
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accessibility Info */}
              {(event.accessibility.asl || event.accessibility.stepFree || event.accessibility.quietRoom || event.accessibility.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {event.accessibility.asl && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>ASL interpreter available</span>
                        </div>
                      )}
                      {event.accessibility.stepFree && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>Step-free access</span>
                        </div>
                      )}
                      {event.accessibility.quietRoom && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span>Quiet room available</span>
                        </div>
                      )}
                      {event.accessibility.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {event.accessibility.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabs for Description and Comments */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="about" className="mt-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-lg">{event.shortDescription}</p>
                    {event.longDescription && (
                      <div className="mt-4 whitespace-pre-wrap">
                        {event.longDescription}
                      </div>
                    )}
                  </div>
                  {event.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="comments" className="mt-6">
                  <CommentSection eventId={event._id} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* RSVP Card */}
              <Card>
                <CardContent className="pt-6">
                  <RsvpButton
                    eventId={event._id}
                    eventSlug={event.slug}
                    rsvpMode={event.rsvpMode}
                    rsvpUrl={event.rsvpUrl}
                    capacity={event.capacity}
                    currentRsvps={event.metrics.rsvps}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Directions
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/api/events/${event.slug}/ical`}>
                      <Download className="mr-2 h-4 w-4" />
                      Export to Calendar
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>
                </CardContent>
              </Card>

              {/* Admin Actions */}
              {canEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Manage Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/events/${event.slug}/edit`}>
                        Edit Event
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Report */}
              {session && !isOwner && (
                <ReportDialog targetType="event" targetId={event._id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

