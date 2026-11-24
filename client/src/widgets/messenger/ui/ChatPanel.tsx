import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ConversationDto, PublicUserDto } from '@social/shared';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import {
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} from '@/entities/message';
import { UserAvatar } from '@/entities/user';
import { joinConversationRoom, leaveConversationRoom } from '@/shared';

import { useConversationClear } from '../lib/useConversationClear';
import { useTypingController } from '../lib/useTypingController';
import { MessageBubble } from './MessageBubble';

const MESSAGE_MAX_LENGTH = 2000;
const CLEAR_DIALOG_TITLE_ID = 'clear-conversation-dialog-title';

type Props = {
  conversation: ConversationDto;
  partner: PublicUserDto;
  currentUserId: string;
};

export function ChatPanel({ conversation, partner, currentUserId }: Props) {
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading, isError } = useGetConversationMessagesQuery(
    conversation.id,
  );
  const [sendMessage, { isLoading: isSending }] = useSendConversationMessageMutation();
  const { partnerIsTyping, notifyTyping, stopTyping } = useTypingController({
    conversationId: conversation.id,
    userId: currentUserId,
  });
  const {
    anchorEl,
    isDialogOpen,
    isSnackbarOpen,
    isClearing,
    clearError,
    openMenuHandler,
    closeMenuHandler,
    openDialogHandler,
    closeDialogHandler,
    confirmClearHandler,
    closeSnackbarHandler,
  } = useConversationClear({ conversationId: conversation.id });

  useEffect(() => {
    joinConversationRoom(conversation.id);

    return () => {
      leaveConversationRoom(conversation.id);
    };
  }, [conversation.id]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation.id, messages.length]);

  const sendCurrentMessage = async (): Promise<void> => {
    const trimmedText = text.trim();

    if (!trimmedText || isSending) {
      return;
    }

    setSendError(false);

    try {
      await sendMessage({ conversationId: conversation.id, text: trimmedText }).unwrap();
      setText('');
      stopTyping();
    } catch {
      setSendError(true);
    }
  };

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void sendCurrentMessage();
  };

  const changeHandler = (value: string): void => {
    setText(value);
    setSendError(false);

    if (value.trim().length === 0) {
      stopTyping();
      return;
    }

    notifyTyping();
  };

  const keyDownHandler = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  };

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <Stack sx={{ width: '100%', height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <IconButton
          component={Link}
          href="/messages"
          aria-label="Назад"
          sx={{ display: { xxs: 'inline-flex', md: 'none' }, flexShrink: 0 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <UserAvatar username={partner.username} src={partner.avatar} size={40} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component={Link}
            href={`/profile/${partner.id}`}
            variant="subtitle1"
            noWrap
            sx={{ color: 'text.primary', fontWeight: 600, textDecoration: 'none' }}
          >
            {partner.username}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: partnerIsTyping ? 'primary.main' : 'text.secondary' }}
          >
            {partnerIsTyping ? 'печатает...' : ''}
          </Typography>
        </Box>
        <IconButton
          aria-label="Действия с диалогом"
          onClick={openMenuHandler}
          sx={{ flexShrink: 0 }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenuHandler}>
          <MenuItem onClick={openDialogHandler}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DeleteOutlinedIcon color="error" />
            </ListItemIcon>
            <ListItemText>Очистить диалог</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      <Box
        ref={messagesContainerRef}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xxs: 1.5, sm: 3 }, py: 2 }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : null}

        {isError ? <Alert severity="error">Не удалось загрузить сообщения</Alert> : null}

        {!isLoading && !isError && messages.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Сообщений пока нет
          </Typography>
        ) : null}

        <Stack spacing={1.25}>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))}
        </Stack>
      </Box>

      <Box
        component="form"
        onSubmit={submitHandler}
        sx={{ width: '100%', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Напишите сообщение..."
            value={text}
            onChange={(event) => changeHandler(event.target.value)}
            onKeyDown={keyDownHandler}
            slotProps={{ htmlInput: { maxLength: MESSAGE_MAX_LENGTH } }}
            sx={{ flex: 1 }}
          />
          <IconButton
            type="submit"
            color="primary"
            aria-label="Отправить сообщение"
            disabled={!canSend}
            sx={{ flexShrink: 0 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        {sendError ? (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            Не удалось отправить сообщение
          </Typography>
        ) : null}
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={closeDialogHandler}
        fullWidth
        maxWidth="xs"
        aria-labelledby={CLEAR_DIALOG_TITLE_ID}
        slotProps={{
          paper: {
            sx: {
              m: { xxs: 1.5, sm: 3 },
              width: '100%',
              maxWidth: { xxs: 'calc(100% - 24px)', sm: 400 },
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogTitle id={CLEAR_DIALOG_TITLE_ID}>Очистить диалог?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Все сообщения в этом диалоге будут удалены без возможности восстановления.
          </DialogContentText>
          {clearError ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Не удалось очистить диалог
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialogHandler} disabled={isClearing}>
            Отмена
          </Button>
          <Button
            onClick={() => void confirmClearHandler()}
            color="error"
            variant="contained"
            disabled={isClearing}
            startIcon={isClearing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbarHandler}
        message="История диалога очищена"
      />
    </Stack>
  );
}
