'use client';

import type { AuthResponse } from '@social/shared';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { selectIsAuthenticated, setCredentials } from '@/entities/auth';
import { LoginForm } from '@/features/auth';
import { baseApi } from '@/shared';

import { useAppDispatch, useAppSelector } from '../providers/hooks';

export default function LoginPage() {
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
    router.push(`/profile/${auth.user.id}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: { xxs: 2, sm: 4 }, borderRadius: 2 }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
            Вход
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Войдите, чтобы продолжить работу в социальной сети
          </Typography>
        </Stack>
        <LoginForm onAuthenticated={authenticatedHandler} />
      </Stack>
    </Paper>
  );
}
