'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Flag } from 'lucide-react';

interface ReportDialogProps {
  targetType: 'event' | 'comment' | 'user';
  targetId: string;
  trigger?: React.ReactNode;
}

export default function ReportDialog({ targetType, targetId, trigger }: ReportDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
      setReason('');

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-destructive">
            <AlertCircle className="mr-2 h-4 w-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {targetType}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert>
            <AlertDescription>
              Thank you for your report. Our moderation team will review it shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="reason">
                  Please describe why you're reporting this {targetType} *
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details about why this content is inappropriate..."
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={5}
                  disabled={loading}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reason.length}/1000 characters (minimum 10)
                </p>
              </div>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-semibold mb-1">Report Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Be specific about the issue</li>
                  <li>Reports are reviewed by trained moderators</li>
                  <li>False reports may result in account suspension</li>
                  <li>Your report is confidential</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || reason.length < 10}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

