'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { clearCredentials, hasAuthSession, setCredentials } from '@/entities/auth';
import { useRefreshMutation } from '@/features/auth';
import { baseApi } from '@/shared';

import { useAppDispatch, useAppSelector } from './hooks';

type Props = {
  children: ReactNode;
};

export function AuthGate({ children }: Props) {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const didInitializeRef = useRef(false);

  useEffect(() => {
    if (!hasAuthSession()) {
      setIsSessionChecked(true);
      return;
    }

    if (didInitializeRef.current) {
      return;
    }

    didInitializeRef.current = true;

    async function restoreSession(): Promise<void> {
      try {
        const auth = await refresh().unwrap();

        dispatch(baseApi.util.resetApiState());
        dispatch(setCredentials(auth));
      } catch {
        dispatch(baseApi.util.resetApiState());
        dispatch(clearCredentials());
      } finally {
        setIsSessionChecked(true);
      }
    }

    void restoreSession();
  }, [dispatch, refresh]);

  if (!isSessionChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
