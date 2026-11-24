import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Header } from '@/widgets/header';

import { AppShell, AuthGate, MuiProvider, SocketProvider, StoreProvider } from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Социальная сеть',
  description: 'Социальная сеть для общения и обмена моментами с друзьями',
  icons: {
    icon: '/icon.svg',
  },
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ru">
      <body>
        <AppRouterCacheProvider>
          <MuiProvider>
            <StoreProvider>
              <SocketProvider>
                <Header />
                <AuthGate>
                  <AppShell>{children}</AppShell>
                </AuthGate>
              </SocketProvider>
            </StoreProvider>
          </MuiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
