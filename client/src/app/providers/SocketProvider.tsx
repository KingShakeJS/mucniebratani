'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { selectAccessToken } from '@/entities/auth';
import { setSocketAccessToken } from '@/shared';

import { useAppSelector } from './hooks';

type Props = {
  children: ReactNode;
};

export function SocketProvider({ children }: Props) {
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    setSocketAccessToken(accessToken);
  }, [accessToken]);

  return <>{children}</>;
}
