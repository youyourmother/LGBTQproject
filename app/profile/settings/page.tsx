'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MainLayout from '@/components/layout/main-layout';
import { Save, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    displayName: '',
    pronouns: '',
    emailOptIn: true,
    profileVisibility: 'public' as 'public' | 'members' | 'private',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchUserSettings();
    }
  }, [session]);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/profile/settings');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          displayName: data.displayName || '',
          pronouns: data.pronouns || '',
          emailOptIn: data.settings?.emailOptIn ?? true,
          profileVisibility: data.settings?.profileVisibility || 'public',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Restructure data to match backend validation schema
      const payload = {
        displayName: formData.displayName,
        pronouns: formData.pronouns,
        settings: {
          emailOptIn: formData.emailOptIn,
          profileVisibility: formData.profileVisibility,
        },
      };

      const response = await fetch('/api/profile/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      
      // Update session
      await update({
        displayName: formData.displayName,
        pronouns: formData.pronouns,
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push('/auth/signin?callbackUrl=/profile/settings');
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/profile')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {success && (
            <Alert className="mb-6">
              <AlertDescription className="text-success">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder={session.user.name || 'Your display name'}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be shown instead of your account name
                  </p>
                </div>

                <div>
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    value={formData.pronouns}
                    onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                    placeholder="e.g., she/her, he/him, they/them"
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label>Profile Visibility</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.profileVisibility === 'public'}
                        onChange={() => setFormData({ ...formData, profileVisibility: 'public' })}
                      />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-sm text-muted-foreground">Anyone can see your profile</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="members"
                        checked={formData.profileVisibility === 'members'}
                        onChange={() => setFormData({ ...formData, profileVisibility: 'members' })}
                      />
                      <div>
                        <div className="font-medium">Members Only</div>
                        <div className="text-sm text-muted-foreground">Only signed-in users can see your profile</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.profileVisibility === 'private'}
                        onChange={() => setFormData({ ...formData, profileVisibility: 'private' })}
                      />
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-sm text-muted-foreground">Only you can see your profile</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailOptIn"
                    checked={formData.emailOptIn}
                    onChange={(e) => setFormData({ ...formData, emailOptIn: e.target.checked })}
                  />
                  <Label htmlFor="emailOptIn" className="font-normal cursor-pointer">
                    Send me email updates about events I'm interested in
                  </Label>
                </div>

                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

