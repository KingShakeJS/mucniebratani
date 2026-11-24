'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthRedirect(isAuthenticated: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
}
