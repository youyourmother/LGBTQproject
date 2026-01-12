'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Settings, Calendar, Users, AlertCircle } from 'lucide-react';
import logo from './logo.png';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const navigation = [
    { name: 'Events', href: '/events' },
    { name: 'Communities', href: '/communities' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src={logo}
                alt="+Philia Hub Logo" 
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
                  <Link href="/events/create">Create Event</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                        {session.user?.pronouns && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.pronouns}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile#rsvps" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My RSVPs</span>
                      </Link>
                    </DropdownMenuItem>
                    {session.user?.role === 'org_admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/org" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          <span>My Organizations</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {(session.user?.role === 'admin' || session.user?.role === 'moderator') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            <span>Moderation</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {session && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/events/create"
                  className="block px-3 py-2 text-base font-medium text-primary hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
              </>
            )}
            {!session && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

