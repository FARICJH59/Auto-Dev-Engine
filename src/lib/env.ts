// Copilot: Environment variable validation and type-safe access
// Ensures all required environment variables are present at runtime

/**
 * Validates and returns required environment variables
 * Throws error if required variables are missing
 */
export function getEnv() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!clerkPublishableKey) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
  }

  if (!clerkSecretKey && typeof window === 'undefined') {
    throw new Error('Missing CLERK_SECRET_KEY environment variable');
  }

  if (!apiUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL environment variable');
  }

  return {
    clerkPublishableKey,
    clerkSecretKey,
    apiUrl,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    databaseUrl: process.env.DATABASE_URL,
  };
}

/**
 * Get public environment variables (safe for client-side)
 */
export function getPublicEnv() {
  return {
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}
