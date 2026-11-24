'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, use } from 'react';

import { selectIsAuthenticated } from '@/entities/auth';
import { useGetUserByIdQuery } from '@/entities/user';
import { getErrorMessage, useGetMeQuery } from '@/features/auth';
import { ProfileCard } from '@/widgets/profile-card';

import { useAppSelector } from '../../providers/hooks';

type Props = {
  params: Promise<{ id: string }>;
};

export default function UserProfilePage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwnProfile = Boolean(currentUser && currentUser.id === id);

  const ownProfileQuery = useGetMeQuery(undefined, { skip: !isOwnProfile });
  const publicProfileQuery = useGetUserByIdQuery(id, { skip: isOwnProfile });

  const isLoading = isOwnProfile ? ownProfileQuery.isLoading : publicProfileQuery.isLoading;
  const isError = isOwnProfile ? ownProfileQuery.isError : publicProfileQuery.isError;
  const error = isOwnProfile ? ownProfileQuery.error : publicProfileQuery.error;
  const user = isOwnProfile ? ownProfileQuery.data : publicProfileQuery.data;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  const publicationsTitle = isOwnProfile ? 'Мои публикации' : 'Публикации';
  const emptyPublicationsMessage = isOwnProfile
    ? 'У вас пока нет ни одной публикации'
    : 'У пользователя пока нет ни одной публикации';

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, fontSize: { xxs: '1.5rem', sm: '2.125rem' } }}
      >
        {isOwnProfile ? 'Профиль' : 'Профиль пользователя'}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xxs: 2, md: 3 },
          width: '100%',
          minWidth: 0,
        }}
      >
        <ProfileCard user={user} isOwnProfile={isOwnProfile} />

        <Paper elevation={2} sx={{ p: { xxs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {publicationsTitle}
          </Typography>
          <Box sx={{ textAlign: 'center', py: { xxs: 4, sm: 6 } }}>
            <Typography color="text.secondary">{emptyPublicationsMessage}</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
