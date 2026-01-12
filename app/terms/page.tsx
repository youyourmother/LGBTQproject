import MainLayout from '@/components/layout/main-layout';

export const metadata = {
  title: 'Terms of Service - +Philia Hub',
};

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: October 29, 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using +Philia Hub, you accept and agree to be bound by the terms and
            provisions of this agreement. If you do not agree to these terms, please do not use this service.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use +Philia Hub. By using this service, you represent
            and warrant that you meet this age requirement.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You
            agree to accept responsibility for all activities that occur under your account.
          </p>

          <h2>4. User Content</h2>
          <p>
            You retain ownership of any content you post on +Philia Hub. By posting content, you grant
            us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your
            content on the platform.
          </p>

          <h2>5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Post content that is hateful, discriminatory, or harassing</li>
            <li>Violate any laws or regulations</li>
            <li>Impersonate any person or entity</li>
            <li>Spam or post unsolicited commercial content</li>
            <li>Interfere with the proper functioning of the platform</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
          </ul>

          <h2>6. Content Moderation</h2>
          <p>
            We reserve the right to remove any content or suspend any account that violates these
            terms or our community guidelines. We employ both automated and human moderation.
          </p>

          <h2>7. Privacy</h2>
          <p>
            Your use of +Philia Hub is also governed by our Privacy Policy. Please review our Privacy
            Policy to understand our practices.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            +Philia Hub is provided "as is" without warranties of any kind, either express or implied.
            We do not warrant that the service will be uninterrupted, secure, or error-free.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, +Philia Hub shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages resulting from your use of the service.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of Michigan, United States, without
            regard to its conflict of law provisions.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material
            changes. Your continued use of the service after such modifications constitutes acceptance
            of the updated terms.
          </p>

          <h2>12. Contact</h2>
          <p>
            If you have any questions about these Terms, please{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

