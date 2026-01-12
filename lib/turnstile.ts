/**
 * Cloudflare Turnstile verification
 */

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('Turnstile secret key not configured');
    // Allow in development if no key configured
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile:', error);
    return false;
  }
}

