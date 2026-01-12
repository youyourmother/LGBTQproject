import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out certain errors
  ignoreErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
  ],

  beforeSend(event) {
    // Don't send events if DSN is not configured
    if (!process.env.SENTRY_DSN) {
      return null;
    }
    return event;
  },
});

