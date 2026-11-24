'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

import type { AuthState } from '@/entities/auth';
import { clearAuthSession, clearCredentials } from '@/entities/auth';
import { useLogoutMutation } from '@/features/auth';
import { baseApi } from '@/shared';

const compactButtonSx = {
  px: { xxs: 0.75, sm: 1.5 },
  minWidth: { xxs: 'auto', sm: 64 },
  fontSize: { xxs: '0.75rem', sm: '0.875rem' },
};

export function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: { auth: AuthState }) => state.auth);
  const [logoutUser] = useLogoutMutation();
  const isAuthenticated = Boolean(auth.accessToken);
  const username = auth.user?.username ?? 'пользователь';
  const profilePath = auth.user ? `/profile/${auth.user.id}` : '/profile';

  const logoutHandler = async (): Promise<void> => {
    await logoutUser();
    dispatch(baseApi.util.resetApiState());
    dispatch(clearCredentials());
    clearAuthSession();
    router.replace('/login');
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar disableGutters>
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xxs: 0.5, sm: 1.5 },
            px: { xxs: 1, sm: 3 },
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none', minWidth: 0 }}>
            <Typography
              variant="h6"
              component="span"
              noWrap
              sx={{
                fontWeight: 900,
                fontSize: { xxs: '0.85rem', xs: '1rem', sm: '1.25rem' },
                whiteSpace: 'nowrap',
              }}
            >
              Мучное братство
            </Typography>
          </Link>

          <Stack
            direction="row"
            spacing={{ xxs: 0.5, sm: 1.5 }}
            useFlexGap
            sx={{ alignItems: 'center', flexShrink: 0 }}
          >
            {isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  href="/"
                  color="inherit"
                  size="small"
                  sx={{ ...compactButtonSx, display: { xxs: 'none', sm: 'inline-flex' } }}
                >
                  Лента
                </Button>
                <Link
                  href={profilePath}
                  style={{ display: 'inline-flex', textDecoration: 'none' }}
                  aria-label="Перейти в профиль"
                >
                  <Avatar
                    src={auth.user?.avatar || undefined}
                    alt={username}
                    sx={{
                      width: { xxs: 28, xs: 32 },
                      height: { xxs: 28, xs: 32 },
                      bgcolor: 'primary.dark',
                      fontSize: { xxs: '0.75rem', xs: '0.875rem' },
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                </Link>
                <Tooltip title="Выйти">
                  <IconButton
                    color="inherit"
                    size="small"
                    aria-label="Выйти"
                    onClick={logoutHandler}
                    sx={{ display: { xxs: 'inline-flex', sm: 'none' }, p: 0.5 }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  color="inherit"
                  size="small"
                  onClick={logoutHandler}
                  sx={{ ...compactButtonSx, display: { xxs: 'none', sm: 'inline-flex' } }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/register"
                  color="inherit"
                  size="small"
                  sx={compactButtonSx}
                >
                  Регистрация
                </Button>
                <Button component={Link} href="/login" color="inherit" size="small" sx={compactButtonSx}>
                  Войти
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
