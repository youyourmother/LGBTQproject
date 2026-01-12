/**
 * Simple in-memory rate limiter
 * For production, consider using Upstash Redis or similar
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  interval: number; // in milliseconds
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { interval: 60 * 1000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 1,
      resetAt: now + options.interval,
    };
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetAt: store[key].resetAt,
    };
  }

  if (store[key].count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: store[key].resetAt,
    };
  }

  store[key].count++;
  return {
    success: true,
    remaining: options.maxRequests - store[key].count,
    resetAt: store[key].resetAt,
  };
}

// Preset rate limiters for common actions
export const authRateLimit = (identifier: string) =>
  rateLimit(identifier, { interval: 15 * 60 * 1000, maxRequests: 5 }); // 5 per 15 minutes

export const createEventRateLimit = (identifier: string) =>
  rateLimit(identifier, { interval: 60 * 60 * 1000, maxRequests: 10 }); // 10 per hour

export const commentRateLimit = (identifier: string) =>
  rateLimit(identifier, { interval: 60 * 1000, maxRequests: 20 }); // 20 per minute

export const reportRateLimit = (identifier: string) =>
  rateLimit(identifier, { interval: 60 * 60 * 1000, maxRequests: 5 }); // 5 per hour

export const contactRateLimit = (identifier: string) =>
  rateLimit(identifier, { interval: 60 * 60 * 1000, maxRequests: 3 }); // 3 per hour

