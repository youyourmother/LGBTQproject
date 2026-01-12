'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    pronouns: '',
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred during signup');
        return;
      }

      setSuccess(true);
      
      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin?registered=true');
      }, 3000);
    } catch (err) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
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
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to <strong>{formData.email}</strong>.
              Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in...
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Join +Philia Hub
          </CardTitle>
          <CardDescription>
            Find your people. Find your power.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="At least 8 characters"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium mb-1">
                Pronouns (optional)
              </label>
              <Input
                id="pronouns"
                type="text"
                value={formData.pronouns}
                onChange={(e) => handleChange('pronouns', e.target.value)}
                placeholder="e.g. she/her, he/him, they/them"
                disabled={loading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="ageConfirmed"
                  checked={formData.ageConfirmed}
                  onCheckedChange={(checked) => handleChange('ageConfirmed', checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="ageConfirmed"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am 18 years or older <span className="text-destructive">*</span>
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleChange('termsAccepted', checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="termsAccepted"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{' '}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  <span className="text-destructive">*</span>
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => handleChange('privacyAccepted', checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="privacyAccepted"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{' '}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>{' '}
                  <span className="text-destructive">*</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

