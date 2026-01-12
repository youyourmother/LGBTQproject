'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MainLayout from '@/components/layout/main-layout';
import PlacesAutocomplete from '@/components/events/places-autocomplete';
import { ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';

const EVENT_TYPES = ['social', 'support', 'education', 'celebration', 'entertainment', 'community'];
const EVENT_TAGS = ['pride', 'trans', 'youth', 'support', 'party', 'workshop', 'books', 'art', 'sports', 'fundraiser'];

export default function EditEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/events/${slug}/edit`);
      return;
    }

    if (status === 'authenticated') {
      fetchEvent();
    }
  }, [status, slug]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`);
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const data = await response.json();
      
      // Format dates for datetime-local input
      const event = data.event;
      setFormData({
        title: event.title,
        organizerType: event.organizerType,
        startsAt: new Date(event.startsAt).toISOString().slice(0, 16),
        endsAt: new Date(event.endsAt).toISOString().slice(0, 16),
        timezone: event.timezone,
        location: event.location,
        types: event.types,
        tags: event.tags,
        shortDescription: event.shortDescription,
        longDescription: event.longDescription || '',
        accessibility: event.accessibility,
        capacity: event.capacity?.toString() || '',
        rsvpMode: event.rsvpMode,
        rsvpUrl: event.rsvpUrl || '',
        visibility: event.visibility,
      });
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelected = (place: any) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        placeId: place.placeId,
        formattedAddress: place.formattedAddress,
        geo: place.geo,
      },
    });
  };

  const toggleType = (type: string) => {
    setFormData({
      ...formData,
      types: formData.types.includes(type)
        ? formData.types.filter((t: string) => t !== type)
        : [...formData.types, type],
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((t: string) => t !== tag)
        : [...formData.tags, tag],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      router.push(`/events/${slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/events/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      setDeleting(false);
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

  if (!formData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Event not found or you don't have permission to edit it.</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push(`/events/${slug}`)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Event</h1>
            <p className="mt-2 text-muted-foreground">Update your event details</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    required
                    maxLength={280}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.shortDescription.length}/280 characters
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="startsAt">Start Date & Time *</Label>
                    <Input
                      id="startsAt"
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endsAt">End Date & Time *</Label>
                    <Input
                      id="endsAt"
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Event Types *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EVENT_TYPES.map((type) => (
                      <Badge
                        key={type}
                        variant={formData.types.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EVENT_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.tags.includes(tag) ? 'secondary' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Location *</Label>
                  <PlacesAutocomplete 
                    onPlaceSelected={handlePlaceSelected}
                    defaultValue={formData.location.formattedAddress}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Current: {formData.location.formattedAddress}
                  </p>
                </div>

                <div>
                  <Label htmlFor="roomNotes">Room/Meeting Notes</Label>
                  <Input
                    id="roomNotes"
                    value={formData.location.roomNotes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, roomNotes: e.target.value },
                      })
                    }
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor="longDescription">Full Description</Label>
                  <Textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={6}
                    maxLength={5000}
                  />
                </div>

                <div>
                  <Label>Accessibility Features</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="asl"
                        checked={formData.accessibility.asl}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            accessibility: { ...formData.accessibility, asl: checked as boolean },
                          })
                        }
                      />
                      <Label htmlFor="asl" className="font-normal cursor-pointer">
                        ASL interpreter available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stepFree"
                        checked={formData.accessibility.stepFree}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            accessibility: { ...formData.accessibility, stepFree: checked as boolean },
                          })
                        }
                      />
                      <Label htmlFor="stepFree" className="font-normal cursor-pointer">
                        Step-free access
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="quietRoom"
                        checked={formData.accessibility.quietRoom || false}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            accessibility: { ...formData.accessibility, quietRoom: checked as boolean },
                          })
                        }
                      />
                      <Label htmlFor="quietRoom" className="font-normal cursor-pointer">
                        Quiet room available
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    className="mt-2"
                    placeholder="Additional accessibility notes..."
                    value={formData.accessibility.notes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accessibility: { ...formData.accessibility, notes: e.target.value },
                      })
                    }
                    maxLength={500}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RSVP & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={() => setFormData({ ...formData, visibility: 'public' })}
                      />
                      <span>Public</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="unlisted"
                        checked={formData.visibility === 'unlisted'}
                        onChange={() => setFormData({ ...formData, visibility: 'unlisted' })}
                      />
                      <span>Unlisted</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || saving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete Event'}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/events/${slug}`)}
                  disabled={saving || deleting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || deleting}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

