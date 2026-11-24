'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { selectIsAuthenticated } from '@/entities/auth';
import { Sidebar } from '@/widgets/sidebar';

import { useAppSelector } from './hooks';

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const isMessengerRoute = pathname?.startsWith('/messages') ?? false;

  return (
    <Box
      sx={{
        display: 'flex',
        height: isMessengerRoute
          ? { xxs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' }
          : 'auto',
        minHeight: isMessengerRoute ? 0 : { xxs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
      }}
    >
      {isAuthenticated ? <Sidebar /> : null}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
          overflowY: isMessengerRoute ? 'hidden' : undefined,
          pb: { xxs: 9, md: 0 },
          height: isMessengerRoute ? '100%' : 'auto',
          boxSizing: 'border-box',
        }}
      >
        {isMessengerRoute ? (
          <Box sx={{ width: '100%', height: '100%' }}>{children}</Box>
        ) : (
          <Container maxWidth="xxl" sx={{ py: { xxs: 2, md: 4 } }}>
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
}
