'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MainLayout from '@/components/layout/main-layout';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const ORG_TAGS = ['support', 'advocacy', 'social', 'education', 'health', 'arts', 'sports', 'youth', 'seniors', 'trans', 'bi', 'lesbian', 'gay', 'queer'];

export default function CreateOrgPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);

    try {
      const response = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization');
      }

      router.push('/org');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

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
    router.push('/auth/signin?callbackUrl=/org/create');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/org')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create Organization
            </h1>
            <p className="mt-2 text-muted-foreground">
              Set up your organization to manage events and build your community
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Tell us about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pride Community Center"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your organization's mission and activities..."
                    required
                    maxLength={1000}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div>
                  <Label>Tags (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select tags that describe your organization
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ORG_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">After Creation:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You'll be able to create events on behalf of the organization</li>
                    <li>• Invite team members to help manage events</li>
                    <li>• Request verification for a verified badge</li>
                    <li>• View analytics for your organization's events</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/org')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

