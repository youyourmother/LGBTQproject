'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, Clock } from 'lucide-react';

interface RsvpButtonProps {
  eventId: string;
  eventSlug: string;
  rsvpMode: 'external' | 'on_platform';
  rsvpUrl?: string;
  capacity?: number;
  currentRsvps: number;
}

export default function RsvpButton({
  eventId,
  eventSlug,
  rsvpMode,
  rsvpUrl,
  capacity,
  currentRsvps,
}: RsvpButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'interested' | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's RSVP status
  useEffect(() => {
    if (session && rsvpMode === 'on_platform') {
      fetchRsvpStatus();
    }
  }, [session, eventId]);

  const fetchRsvpStatus = async () => {
    try {
      const response = await fetch(`/api/events/${eventSlug}/rsvp`);
      if (response.ok) {
        const data = await response.json();
        setRsvpStatus(data.status || null);
      }
    } catch (error) {
      console.error('Error fetching RSVP status:', error);
    }
  };

  const handleRsvp = async (status: 'going' | 'interested') => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/events/${eventSlug}`);
      return;
    }

    if (!session.user.emailVerified) {
      alert('Please verify your email before RSVPing to events');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to RSVP');
      }

      const data = await response.json();
      setRsvpStatus(data.status);
      router.refresh(); // Refresh server component data
    } catch (error: any) {
      alert(error.message || 'Failed to RSVP');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventSlug}/rsvp`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel RSVP');
      }

      setRsvpStatus(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel RSVP');
    } finally {
      setLoading(false);
    }
  };

  // External RSVP
  if (rsvpMode === 'external' && rsvpUrl) {
    return (
      <Button className="w-full" size="lg" asChild>
        <a href={rsvpUrl} target="_blank" rel="noopener noreferrer">
          RSVP on External Site
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    );
  }

  // Check if event is full
  const isFull = Boolean(capacity && currentRsvps >= capacity);

  if (status === 'loading') {
    return (
      <Button className="w-full" size="lg" disabled>
        Loading...
      </Button>
    );
  }

  if (!session) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push(`/auth/signin?callbackUrl=/events/${eventSlug}`)}
      >
        Sign in to RSVP
      </Button>
    );
  }

  if (rsvpStatus === 'going') {
    return (
      <div className="space-y-2">
        <Button className="w-full" size="lg" variant="default" disabled>
          <Check className="mr-2 h-4 w-4" />
          You're Going!
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCancelRsvp}
          disabled={loading}
        >
          Cancel RSVP
        </Button>
      </div>
    );
  }

  if (rsvpStatus === 'interested') {
    return (
      <div className="space-y-2">
        <Button className="w-full" size="lg" variant="outline" disabled>
          <Clock className="mr-2 h-4 w-4" />
          Interested
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleRsvp('going')}
            disabled={loading || isFull}
          >
            I'm Going
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelRsvp}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="space-y-2">
        <Button className="w-full" size="lg" variant="outline" disabled>
          Event Full
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleRsvp('interested')}
          disabled={loading}
        >
          Mark as Interested
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={() => handleRsvp('going')}
        disabled={loading}
      >
        {loading ? 'Processing...' : "I'm Going"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => handleRsvp('interested')}
        disabled={loading}
      >
        Interested
      </Button>
    </div>
  );
}

