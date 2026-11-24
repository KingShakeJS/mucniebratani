'use client';

import type { PublicUserDto, UserRole } from '@social/shared';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Shield from '@mui/icons-material/Shield';
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type ReactElement } from 'react';

import { formatRegistrationDate, UserAvatar } from '@/entities/user';
import { SendMessageModal } from '@/features/send-message';

type Props = {
  user: PublicUserDto;
  isOwnProfile: boolean;
};

type StatisticProps = {
  label: string;
  value: number;
};

type RoleBadge = {
  label: string;
  color: 'primary' | 'secondary' | 'default';
  variant: 'filled' | 'outlined';
  icon?: ReactElement;
};

const ROLE_BADGES: Record<UserRole, RoleBadge> = {
  superadmin: {
    label: 'альфа питух',
    color: 'primary',
    variant: 'filled',
    icon: <WorkspacePremium fontSize="small" />,
  },
  admin: {
    label: 'питух',
    color: 'secondary',
    variant: 'outlined',
    icon: <Shield fontSize="small" />,
  },
  user: {
    label: 'циплёнок',
    color: 'default',
    variant: 'outlined',
  },
};

function Statistic({ label, value }: StatisticProps) {
  return (
    <Box
      sx={{
        px: { xxs: 1.5, sm: 2.5 },
        py: 1.5,
        minWidth: { xxs: 0, xs: 96, sm: 112 },
        textAlign: 'center',
        bgcolor: 'action.hover',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h6"
        component="p"
        sx={{
          fontWeight: 700,
          fontSize: { xxs: '1rem', xs: '1.15rem', sm: '1.25rem' },
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: { xxs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function ProfileCard({ user, isOwnProfile }: Props) {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const isBioEmpty = user.bio.trim().length === 0;
  const role: UserRole = user.role ?? 'user';
  const roleBadge = ROLE_BADGES[role];

  return (
    <Paper elevation={2} sx={{ p: { xxs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}>
      <Stack
        spacing={{ xxs: 2, md: 3 }}
        sx={{
          flexDirection: { xxs: 'column', md: 'row' },
          flexWrap: { md: 'wrap' },
          alignItems: { xxs: 'stretch', md: 'flex-start' },
        }}
      >
        <Stack
          spacing={2}
          sx={{
            flex: { md: '1 1 280px' },
            minWidth: 0,
            flexDirection: { xxs: 'column', sm: 'row' },
            alignItems: { xxs: 'center', sm: 'flex-start' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xxs: 'center', sm: 'flex-start' },
              flexShrink: 0,
            }}
          >
            <UserAvatar username={user.username} src={user.avatar} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, textAlign: { xxs: 'center', sm: 'left' } }}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xxs: 'center', sm: 'flex-start' },
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontSize: { xxs: '1.15rem', xs: '1.25rem', sm: '1.5rem' },
                  overflowWrap: 'anywhere',
                }}
              >
                {user.username}
              </Typography>
              <Chip
                label={roleBadge.label}
                size="small"
                color={roleBadge.color}
                variant={roleBadge.variant}
                icon={roleBadge.icon}
              />
              {isOwnProfile ? (
                <Chip label="Это вы" size="small" color="primary" variant="outlined" />
              ) : null}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
            >
              На сайте с {formatRegistrationDate(user.createdAt)}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                О себе
              </Typography>
              {isBioEmpty ? (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Информация о себе пока не заполнена
                </Typography>
              ) : (
                <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {user.bio}
                </Typography>
              )}
              {isOwnProfile ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  title="Функция будет доступна позже"
                  sx={{ mt: 2, width: { xxs: '100%', xs: 'auto' }, whiteSpace: 'nowrap' }}
                >
                  Редактировать профиль
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SendOutlinedIcon />}
                  onClick={() => setIsMessageModalOpen(true)}
                  sx={{ mt: 2, width: { xxs: '100%', xs: 'auto' }, whiteSpace: 'nowrap' }}
                >
                  Написать
                </Button>
              )}
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            width: { xxs: '100%', md: 'auto' },
            flexShrink: 0,
            ml: { md: 'auto' },
            alignSelf: { md: 'flex-start' },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xxs: '1fr', xs: 'repeat(3, minmax(0, 1fr))' },
              gap: { xxs: 1, xs: 1.5, sm: 2 },
              '@media (min-width: 360px)': {
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            <Statistic label="Подписчики" value={user.followersCount} />
            <Statistic label="Подписки" value={user.followingCount} />
            <Statistic label="Публикации" value={0} />
          </Box>
        </Box>
      </Stack>

      <SendMessageModal
        recipient={user}
        open={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </Paper>
  );
}
