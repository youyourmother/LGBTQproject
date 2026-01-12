import MainLayout from '@/components/layout/main-layout';

export const metadata = {
  title: 'Privacy Policy - +Philia Hub',
};

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: October 29, 2025</p>

          <h2>1. Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <ul>
            <li>Account information (name, email, pronouns)</li>
            <li>Profile information (display name, avatar)</li>
            <li>Event information you create</li>
            <li>Comments and interactions</li>
            <li>RSVPs and event attendance</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>Usage data (pages visited, features used)</li>
            <li>Device information (browser type, IP address)</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Communicate with you about events and updates</li>
            <li>Ensure platform safety and prevent abuse</li>
            <li>Analyze usage patterns and optimize performance</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information:</p>
          <ul>
            <li>With other users based on your privacy settings</li>
            <li>With service providers who assist in operating the platform</li>
            <li>When required by law or to protect rights and safety</li>
            <li>In connection with a merger or acquisition (with notice)</li>
          </ul>

          <h2>4. Your Privacy Controls</h2>
          <p>You can:</p>
          <ul>
            <li>Set your profile visibility (public, members-only, or private)</li>
            <li>Control email notifications</li>
            <li>Delete your comments and events</li>
            <li>Request account deletion</li>
            <li>Access and download your data</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide
            services. You may request deletion of your account and data at any time.
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your preferences,
            and analyze usage. You can control cookies through your browser settings.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>Google Maps (for location services)</li>
            <li>Resend (for email delivery)</li>
            <li>Plausible Analytics (privacy-friendly analytics)</li>
            <li>MongoDB Atlas (database hosting)</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            +Philia Hub is not intended for users under 18. We do not knowingly collect information
            from children under 18. If we become aware of such collection, we will delete it promptly.
          </p>

          <h2>10. International Users</h2>
          <p>
            Your information may be transferred to and processed in the United States. By using +Philia Hub,
            you consent to such transfers.
          </p>

          <h2>11. Your Rights</h2>
          <p>Depending on your location, you may have rights including:</p>
          <ul>
            <li>Access to your personal information</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            via email or through the platform.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{' '}
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

