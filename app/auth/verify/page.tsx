'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
          return;
        }

        setStatus('success');
        setMessage(data.message);

        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <CardTitle>Verifying Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 bg-success rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <CardTitle className="text-success">Email Verified!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-12 h-12 bg-destructive rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <CardTitle className="text-destructive">Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        {status === 'success' && (
          <CardContent>
            <Alert>
              <AlertDescription>
                Redirecting to sign in page...
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        <CardFooter className="flex justify-center">
          {status === 'error' && (
            <Button asChild>
              <Link href="/auth/signin">Go to Sign In</Link>
            </Button>
          )}
          {status === 'success' && (
            <Button asChild>
              <Link href="/auth/signin">Sign In Now</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

