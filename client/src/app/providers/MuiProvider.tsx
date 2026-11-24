'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxs: true;
    xxl: true;
  }
}

export const DEFAULT_PRIMARY_COLOR = '#228B22';

const CONTAINER_MAX_WIDTHS = {
  xxs: '100%',
  xs: '100%',
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
} as const;

const theme = createTheme({
  breakpoints: {
    values: {
      xxs: 0,
      xs: 375,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: DEFAULT_PRIMARY_COLOR,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: ({ ownerState, theme: currentTheme }) => {
          const { maxWidth } = ownerState;
          const containerStyles = {
            width: '100%',
            px: { xxs: 1.5, sm: 3 },
          };

          if (!maxWidth) {
            return containerStyles;
          }

          return {
            ...containerStyles,
            [currentTheme.breakpoints.up(maxWidth)]: {
              maxWidth: CONTAINER_MAX_WIDTHS[maxWidth],
            },
          };
        },
      },
    },
  },
});

type Props = {
  children: ReactNode;
};

export function MuiProvider({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
