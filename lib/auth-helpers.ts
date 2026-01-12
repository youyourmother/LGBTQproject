import { getServerSession as getSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Helper to get server session with authOptions
 * Wrapper around getServerSession for consistent usage
 */
export async function getServerSession() {
  return getSession(authOptions);
}

