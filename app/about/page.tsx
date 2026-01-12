import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'About - +Philia Hub',
  description: 'Learn about +Philia Hub and our mission to support the LGBTQ+ community',
};

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            About +Philia Hub
          </h1>

          <div className="prose prose-lg max-w-none space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  +Philia Hub is a community-driven platform dedicated to connecting LGBTQ+ individuals
                  and allies through events, resources, and shared experiences. We believe in creating
                  safe, inclusive spaces where everyone can find their people and discover their power.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Event Discovery</h3>
                  <p className="text-muted-foreground">
                    Find Pride celebrations, support groups, educational workshops, social gatherings,
                    and more happening in your community.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Community Building</h3>
                  <p className="text-muted-foreground">
                    Connect with verified organizations and individuals who share your values and identity.
                    Build meaningful relationships and support networks.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Safety First</h3>
                  <p className="text-muted-foreground">
                    We prioritize accessibility information, content moderation, and privacy-first design
                    to keep our community safe and welcoming.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong>Inclusivity:</strong> We welcome all members of the LGBTQ+ community and allies,
                  regardless of identity, background, or experience.
                </div>
                <div>
                  <strong>Safety:</strong> We maintain strict content moderation and privacy standards to
                  ensure everyone feels secure.
                </div>
                <div>
                  <strong>Accessibility:</strong> We design with accessibility in mind, from physical
                  event spaces to digital platforms.
                </div>
                <div>
                  <strong>Community-Driven:</strong> Events for us, by us. Our platform is built to serve
                  the community's needs.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  +Philia Hub is only as strong as its community. Here's how you can contribute:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Create and share events in your area</li>
                  <li>Join verified organizations to expand your reach</li>
                  <li>Participate in community discussions</li>
                  <li>Help moderate content to keep our space safe</li>
                  <li>Spread the word about +Philia Hub</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Have questions, suggestions, or feedback? We'd love to hear from you.{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Get in touch
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

