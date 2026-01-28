import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email })
          .select('+password')
          .lean();

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          role: user.role,
          pronouns: user.pronouns,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_PRIVATE_KEY || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      // For OAuth providers, create or update user
      if (account?.provider !== 'credentials') {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name || 'User',
            email: user.email,
            avatarUrl: user.image,
            emailVerified: new Date(), // OAuth users are auto-verified
            role: 'member',
            settings: {
              emailOptIn: true,
              profileVisibility: 'public',
            },
          });
        } else if (!existingUser.emailVerified) {
          // Auto-verify OAuth users
          existingUser.emailVerified = new Date();
          await existingUser.save();
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.pronouns = user.pronouns;
        token.displayName = user.displayName;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.pronouns = token.pronouns as string | undefined;
        session.user.displayName = token.displayName as string | undefined;
        session.user.emailVerified = token.emailVerified as Date | null | undefined;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' 
    ? 'development-secret-change-in-production' 
    : 'temporary-production-secret-please-set-nexauth-secret'),
  debug: process.env.NODE_ENV === 'development',
};

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    role?: string;
    pronouns?: string;
    displayName?: string;
    avatarUrl?: string;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string;
      pronouns?: string;
      displayName?: string;
      emailVerified?: Date | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    pronouns?: string;
    displayName?: string;
    emailVerified?: Date | null;
  }
}

