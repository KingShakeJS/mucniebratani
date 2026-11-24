'use client';

import type { AuthResponse } from '@social/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { selectIsAuthenticated, setCredentials } from '@/entities/auth';
import { RegistrationPage } from '@/widgets/registration';
import { baseApi } from '@/shared';

import { useAppDispatch, useAppSelector } from '../providers/hooks';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace(`/profile/${currentUser.id}`);
    }
  }, [currentUser, isAuthenticated, router]);

  const authenticatedHandler = (auth: AuthResponse): void => {
    dispatch(baseApi.util.resetApiState());
    dispatch(setCredentials(auth));
  };

  return <RegistrationPage onAuthenticated={authenticatedHandler} />;
}
