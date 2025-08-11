'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from '../lib/auth';

// Ensure CONVEX_URL is available, with fallback for build time
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.warn('NEXT_PUBLIC_CONVEX_URL environment variable is not set. Using placeholder URL for build. Make sure to set this environment variable in your deployment.');
}

const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}
