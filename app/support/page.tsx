import Link from 'next/link';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Shield, Users, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Support - +Philia Hub',
};

export default function SupportPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            Support & Resources
          </h1>

          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Need help? We're here for you.{' '}
                  <Link href="/contact" className="text-primary hover:underline font-medium">
                    Contact us
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Creating Events</CardTitle>
                <CardDescription>Learn how to create and manage events</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Verify your email before creating events</li>
                  <li>• Add detailed accessibility information</li>
                  <li>• Use clear, descriptive titles</li>
                  <li>• Choose appropriate event types and tags</li>
                  <li>• Consider capacity limits for better planning</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community Guidelines</CardTitle>
                <CardDescription>Keep our community safe and welcoming</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Be respectful and inclusive</li>
                  <li>• No hate speech or discrimination</li>
                  <li>• Respect privacy and consent</li>
                  <li>• Report inappropriate content</li>
                  <li>• Follow event-specific rules</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Safety & Moderation</CardTitle>
                <CardDescription>How we keep the community safe</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Content moderation by trained team</li>
                  <li>• Report system for concerning content</li>
                  <li>• Privacy controls for your profile</li>
                  <li>• Email verification required</li>
                  <li>• Rate limiting to prevent spam</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Getting Help</CardTitle>
                <CardDescription>Ways to get support</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use the contact form for questions</li>
                  <li>• Report content via the report button</li>
                  <li>• Check our About page for more info</li>
                  <li>• Review Terms and Privacy Policy</li>
                  <li>• Email: {process.env.SUPPORT_INBOX}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">How do I create an event?</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up, verify your email, then click "Create Event" in the navigation. Fill out
                  the multi-step form with event details, location, and RSVP settings.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Can I edit an event after creating it?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, if you created the event, you can edit it from the event detail page. Click
                  "Edit Event" in the sidebar.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">How do RSVPs work?</h3>
                <p className="text-sm text-muted-foreground">
                  You can RSVP as "Going" or "Interested" for events with on-platform RSVPs. Some
                  events use external RSVP links. Your RSVPs appear in your profile.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">What if I see inappropriate content?</h3>
                <p className="text-sm text-muted-foreground">
                  Use the "Report" button on events, comments, or user profiles. Our moderation team
                  reviews all reports promptly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">How do I delete my account?</h3>
                <p className="text-sm text-muted-foreground">
                  Go to your profile settings and look for the account deletion option. You can also{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>{' '}
                  for assistance.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Is my information private?</h3>
                <p className="text-sm text-muted-foreground">
                  You control your profile visibility settings. Review our{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for details on how we handle your data.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

