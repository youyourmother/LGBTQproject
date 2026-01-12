/**
 * Simple content filter for banned terms
 * This is a basic implementation - consider using more sophisticated
 * moderation services like OpenAI Moderation API for production
 */

const bannedTermsPatterns = [
  // Add patterns for harmful content
  /\b(spam|scam|phishing)\b/gi,
  // Add more patterns as needed
];

export function containsBannedTerms(text: string): boolean {
  if (!text) return false;
  
  return bannedTermsPatterns.some(pattern => pattern.test(text));
}

export function sanitizeContent(text: string): string {
  // Remove excessive whitespace
  let sanitized = text.replace(/\s+/g, ' ').trim();
  
  // Remove potential script tags (extra safety)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  return sanitized;
}

export interface ContentCheckResult {
  isClean: boolean;
  reason?: string;
}

export function checkContent(text: string): ContentCheckResult {
  const sanitized = sanitizeContent(text);
  
  if (containsBannedTerms(sanitized)) {
    return {
      isClean: false,
      reason: 'Content contains prohibited terms',
    };
  }
  
  // Check for excessive capitalization (potential spam)
  const upperCaseRatio = (sanitized.match(/[A-Z]/g) || []).length / sanitized.length;
  if (sanitized.length > 20 && upperCaseRatio > 0.7) {
    return {
      isClean: false,
      reason: 'Excessive capitalization detected',
    };
  }
  
  return { isClean: true };
}

