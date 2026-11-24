'use client';

import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import type { AuthState } from '@/entities/auth';

type NavigationItem = {
  value: string;
  label: string;
  mobileLabel?: string;
  href: string;
  icon: ReactNode;
};

const DESKTOP_DRAWER_WIDTH = 232;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((state: { auth: AuthState }) => state.auth);

  if (!user) {
    return null;
  }

  const navigationItems: NavigationItem[] = [
    {
      value: 'profile',
      label: 'Мой профиль',
      mobileLabel: 'Профиль',
      href: `/profile/${user.id}`,
      icon: <PersonOutlinedIcon />,
    },
    {
      value: 'messages',
      label: 'Сообщения',
      href: '/messages',
      icon: <ChatBubbleOutlinedIcon />,
    },
    {
      value: 'users',
      label: 'Люди',
      href: '/users',
      icon: <PeopleOutlinedIcon />,
    },
  ];
  const currentPath = pathname ?? '';
  const activeValue = currentPath.startsWith('/messages')
    ? 'messages'
    : currentPath.startsWith('/users')
      ? 'users'
      : 'profile';

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xxs: 'none', md: 'block' },
          width: DESKTOP_DRAWER_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          top: 64,
          alignSelf: 'flex-start',
          height: 'calc(100vh - 64px)',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Навигация
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.value} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={activeValue === item.value}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(34, 139, 34, 0.12)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(34, 139, 34, 0.18)',
                    },
                  },
                  '&.Mui-selected .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Paper
        component="nav"
        elevation={3}
        sx={{
          display: { xxs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <BottomNavigation value={activeValue} showLabels sx={{ bgcolor: 'background.paper' }}>
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              value={item.value}
              label={item.mobileLabel ?? item.label}
              icon={item.icon}
              onClick={() => router.push(item.href)}
              sx={{
                minWidth: 0,
                px: 0.5,
                color: activeValue === item.value ? 'primary.main' : undefined,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: { xxs: '0.65rem', sm: '0.75rem' },
                  whiteSpace: 'nowrap',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}
