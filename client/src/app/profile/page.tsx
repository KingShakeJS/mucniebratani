'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { selectIsAuthenticated } from '@/entities/auth';
import { useGetMeQuery } from '@/features/auth';

import { useAppSelector } from '../providers/hooks';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: currentProfile, isFetching } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isFetching) {
      return;
    }

    const targetUserId = currentUser?.id ?? currentProfile?.id;

    if (targetUserId) {
      router.replace(`/profile/${targetUserId}`);
    }
  }, [currentProfile, currentUser, isAuthenticated, isFetching, router]);

  return null;
}
