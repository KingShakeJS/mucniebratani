'use client';

import type { PublicUserDto } from '@social/shared';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import type { AuthState } from '@/entities/auth';
import {
  formatRegistrationDate,
  UserAvatar,
  useSearchUsersQuery,
} from '@/entities/user';
import { useAuthRedirect } from '@/features/auth';
import { SendMessageModal } from '@/features/send-message';
import { useDebounce } from '@/shared';

const SEARCH_DEBOUNCE_MS = 350;

export function UsersPage() {
  const { user, accessToken } = useSelector((state: { auth: AuthState }) => state.auth);
  const isAuthenticated = Boolean(accessToken);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<PublicUserDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchValue, SEARCH_DEBOUNCE_MS);
  const {
    data: users = [],
    isLoading,
    isError,
  } = useSearchUsersQuery({ search: debouncedSearch }, { skip: !isAuthenticated });

  useAuthRedirect(isAuthenticated);

  const clearSearchHandler = (): void => {
    setSearchValue('');
  };

  const writeHandler = (recipient: PublicUserDto): void => {
    setSelectedRecipient(recipient);
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1" sx={{ fontSize: { xxs: '1.5rem', sm: '2.125rem' } }}>
        Люди
      </Typography>

      <TextField
        label="Поиск по имени"
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue ? (
              <InputAdornment position="end">
                <IconButton aria-label="Очистить поиск" onClick={clearSearchHandler} edge="end">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {isError ? <Alert severity="error">Не удалось загрузить пользователей</Alert> : null}

      {!isLoading && !isError && users.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          Пользователи не найдены
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xxs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {users.map((listedUser) => (
          <Paper key={listedUser.id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href={`/profile/${listedUser.id}`}
                style={{ display: 'inline-flex', color: 'inherit', textDecoration: 'none' }}
                aria-label={`Открыть профиль ${listedUser.username}`}
              >
                <UserAvatar username={listedUser.username} src={listedUser.avatar} size={56} />
              </Link>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/profile/${listedUser.id}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {listedUser.username}
                  </Typography>
                </Link>
                <Typography variant="caption" color="text.secondary">
                  На сайте с {formatRegistrationDate(listedUser.createdAt)}
                </Typography>
              </Box>
              {listedUser.id !== user?.id ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SendOutlinedIcon />}
                  onClick={() => writeHandler(listedUser)}
                  sx={{ flexShrink: 0 }}
                >
                  Написать
                </Button>
              ) : null}
            </Stack>
          </Paper>
        ))}
      </Box>

      <SendMessageModal
        recipient={selectedRecipient}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Stack>
  );
}
