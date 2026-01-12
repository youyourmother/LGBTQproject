'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import Turnstile from '@/components/ui/turnstile';
import { Calendar, MapPin, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

const EVENT_TYPES = ['social', 'support', 'education', 'celebration', 'entertainment', 'community'];
const EVENT_TAGS = ['pride', 'trans', 'youth', 'support', 'party', 'workshop', 'books', 'art', 'sports', 'fundraiser'];

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    organizerType: 'individual' as 'individual' | 'organization',
    startsAt: '',
    endsAt: '',
    timezone: 'America/Detroit',
    location: {
      placeId: '',
      formattedAddress: '',
      geo: { type: 'Point' as const, coordinates: [0, 0] as [number, number] },
      roomNotes: '',
    },
    types: [] as string[],
    tags: [] as string[],
    shortDescription: '',
    longDescription: '',
    accessibility: {
      asl: false,
      stepFree: false,
      quietRoom: false,
      notes: '',
    },
    capacity: '',
    rsvpMode: 'on_platform' as 'on_platform' | 'external',
    rsvpUrl: '',
    visibility: 'public' as 'public' | 'unlisted',
  });

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          Loading...
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    router.push('/auth/signin?callbackUrl=/events/create');
    return null;
  }

  // Check email verification through backend, not session
  // The API will enforce this check

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
        ? formData.types.filter(t => t !== type)
        : [...formData.types, type],
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setError('Please complete the security check');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      router.push(`/events/${data.slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Event</h1>
            <p className="mt-2 text-muted-foreground">
              Share your event with the community
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step >= s
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`mx-2 h-1 w-16 ${
                      step > s ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Let's start with the essentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Pride Month Kickoff Party"
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
                      placeholder="A brief description of your event"
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
                    <Label>Event Types * (Select at least one)</Label>
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
                    <Label>Tags (Optional)</Label>
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
            )}

            {/* Step 2: Location & Details */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Location & Details</CardTitle>
                  <CardDescription>Where and how will this event take place?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Location *</Label>
                    <PlacesAutocomplete onPlaceSelected={handlePlaceSelected} />
                    {formData.location.formattedAddress && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {formData.location.formattedAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="roomNotes">Room/Meeting Notes (Optional)</Label>
                    <Input
                      id="roomNotes"
                      value={formData.location.roomNotes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, roomNotes: e.target.value },
                        })
                      }
                      placeholder="e.g., Room 204, Enter through side door"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <Label htmlFor="longDescription">Full Description (Optional)</Label>
                    <Textarea
                      id="longDescription"
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      placeholder="Provide more details about your event..."
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
                          checked={formData.accessibility.quietRoom}
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
                      value={formData.accessibility.notes}
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
            )}

            {/* Step 3: RSVP & Settings */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>RSVP & Settings</CardTitle>
                  <CardDescription>Configure how people can RSVP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="capacity">Capacity (Optional)</Label>
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
                    <Label>RSVP Mode</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rsvpMode"
                          value="on_platform"
                          checked={formData.rsvpMode === 'on_platform'}
                          onChange={(e) => setFormData({ ...formData, rsvpMode: 'on_platform' })}
                        />
                        <span>On-platform RSVP</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rsvpMode"
                          value="external"
                          checked={formData.rsvpMode === 'external'}
                          onChange={(e) => setFormData({ ...formData, rsvpMode: 'external' })}
                        />
                        <span>External link</span>
                      </label>
                    </div>
                  </div>

                  {formData.rsvpMode === 'external' && (
                    <div>
                      <Label htmlFor="rsvpUrl">RSVP URL *</Label>
                      <Input
                        id="rsvpUrl"
                        type="url"
                        value={formData.rsvpUrl}
                        onChange={(e) => setFormData({ ...formData, rsvpUrl: e.target.value })}
                        placeholder="https://..."
                        required={formData.rsvpMode === 'external'}
                      />
                    </div>
                  )}

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
                        <span>Public (appears in search)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="unlisted"
                          checked={formData.visibility === 'unlisted'}
                          onChange={() => setFormData({ ...formData, visibility: 'unlisted' })}
                        />
                        <span>Unlisted (direct link only)</span>
                      </label>
                    </div>
                  </div>

                  {/* Turnstile */}
                  <Turnstile
                    onVerify={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken('')}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto"
                  disabled={
                    (step === 1 && (!formData.title || !formData.shortDescription || !formData.startsAt || !formData.endsAt || formData.types.length === 0)) ||
                    (step === 2 && !formData.location.placeId)
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

