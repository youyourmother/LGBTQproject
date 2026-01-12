import Link from 'next/link';
import Image from 'next/image';
import logo from './logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { name: 'About Us', href: '/about' },
      { name: 'Support', href: '/support' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    community: [
      { name: 'Events', href: '/events' },
      { name: 'Communities', href: '/communities' },
    ],
  };

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src={logo}
                alt="+Philia Hub"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-foreground">+Philia Hub</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Find your people. Find your power. A safe, community-run LGBTQ+ event hub.
            </p>
            <p className="text-xs text-muted-foreground">
              Events for us, by us. 🏳️‍🌈 🏳️‍⚧️
            </p>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold text-foreground mt-6 mb-3">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {currentYear} +Philia Hub. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Accessibility and safety first.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

