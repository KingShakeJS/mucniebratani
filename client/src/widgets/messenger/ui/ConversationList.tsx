import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ConversationDto, PublicUserDto } from '@social/shared';
import Link from 'next/link';

import { formatMessageTime } from '@/entities/conversation';
import { UserAvatar } from '@/entities/user';

type Props = {
  conversations: ConversationDto[];
  currentUserId?: string;
  activeConversationId?: string;
  isLoading: boolean;
  isError: boolean;
};

function getInterlocutor(conversation: ConversationDto, currentUserId?: string): PublicUserDto | null {
  return (
    conversation.participants.find(({ id }) => id !== currentUserId) ??
    conversation.participants[0] ??
    null
  );
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  isLoading,
  isError,
}: Props) {
  return (
    <Stack
      sx={{
        height: '100%',
        borderRight: { md: '1px solid' },
        borderColor: 'divider',
        minHeight: 0,
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" component="h1" sx={{ fontSize: { xxs: '1.25rem', md: '1.5rem' } }}>
          Диалоги
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {isError ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">Не удалось загрузить диалоги</Alert>
          </Box>
        ) : null}

        {!isLoading && !isError && conversations.length === 0 ? (
          <Stack spacing={2} sx={{ p: 3, alignItems: 'center', textAlign: 'center' }}>
            <ChatBubbleOutlinedIcon color="primary" sx={{ fontSize: 44 }} />
            <Typography>У вас пока нет диалогов</Typography>
            <Button component={Link} href="/users" variant="contained">
              Найти людей
            </Button>
          </Stack>
        ) : null}

        {conversations.map((conversation) => {
          const interlocutor = getInterlocutor(conversation, currentUserId);

          if (!interlocutor) {
            return null;
          }

          const isActive = conversation.id === activeConversationId;

          return (
            <Box
              key={conversation.id}
              component={Link}
              href={`/messages/${conversation.id}`}
              sx={{
                display: 'block',
                px: 2,
                py: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                bgcolor: isActive ? 'action.selected' : 'transparent',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <UserAvatar
                  username={interlocutor.username}
                  src={interlocutor.avatar}
                  size={48}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {interlocutor.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {conversation.lastMessage?.text ?? 'Нет сообщений'}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {formatMessageTime(conversation.updatedAt)}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
