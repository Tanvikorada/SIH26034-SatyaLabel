"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Standard internal app architecture: Root redirects to dashboard,
    // which handles auth checks.
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-text-muted font-mono text-sm uppercase tracking-wide">
        Initializing Secure Portal...
      </div>
    </div>
  );
}
