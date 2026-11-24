'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ConversationDto, PublicUserDto } from '@social/shared';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import type { AuthState } from '@/entities/auth';
import { useGetConversationsQuery } from '@/entities/conversation';
import { useAuthRedirect } from '@/features/auth';

import { ChatPanel } from './ChatPanel';
import { ConversationList } from './ConversationList';
import { EmptyChat } from './EmptyChat';

type Props = {
  conversationId?: string;
};

function getPartner(conversation: ConversationDto, currentUserId: string): PublicUserDto | null {
  return (
    conversation.participants.find(({ id }) => id !== currentUserId) ??
    conversation.participants[0] ??
    null
  );
}

export function Messenger({ conversationId }: Props) {
  const { user, accessToken } = useSelector((state: { auth: AuthState }) => state.auth);
  const isAuthenticated = Boolean(accessToken);
  const { data: conversations = [], isLoading, isError } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useAuthRedirect(isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  const currentUserId = user?.id ?? '';
  const activeConversation = conversationId
    ? conversations.find(({ id }) => id === conversationId)
    : undefined;
  const partner = activeConversation ? getPartner(activeConversation, currentUserId) : null;
  const isChatVisibleOnMobile = Boolean(conversationId);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          width: { md: 320 },
          flexShrink: 0,
          minWidth: 0,
          minHeight: 0,
          display: { xxs: isChatVisibleOnMobile ? 'none' : 'flex', md: 'flex' },
        }}
      >
        <ConversationList
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={conversationId}
          isLoading={isLoading}
          isError={isError}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: { xxs: isChatVisibleOnMobile ? 'flex' : 'none', md: 'flex' },
        }}
      >
        {!conversationId ? <EmptyChat /> : null}

        {conversationId && isLoading ? (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : null}

        {conversationId && isError ? (
          <Box sx={{ flex: 1, p: 2 }}>
            <Alert severity="error">Не удалось загрузить диалог</Alert>
          </Box>
        ) : null}

        {conversationId && !isLoading && !isError && !currentUserId ? (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : null}

        {conversationId && !isLoading && !isError && currentUserId && activeConversation && partner ? (
          <ChatPanel
            conversation={activeConversation}
            partner={partner}
            currentUserId={currentUserId}
          />
        ) : null}

        {conversationId && !isLoading && !isError && currentUserId && !activeConversation ? (
          <Stack spacing={2} sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 3 }}>
            <Typography>Диалог не найден</Typography>
            <Button component={Link} href="/messages" variant="contained">
              К диалогам
            </Button>
          </Stack>
        ) : null}
      </Box>
    </Paper>
  );
}
