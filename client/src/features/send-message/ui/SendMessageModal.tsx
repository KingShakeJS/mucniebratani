'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { PublicUserDto, SendDirectMessageInput } from '@social/shared';
import { sendDirectMessageSchema } from '@social/shared';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useSendDirectMessageMutation } from '@/entities/message';
import { UserAvatar } from '@/entities/user';

type Props = {
  recipient: PublicUserDto | null;
  open: boolean;
  onClose: () => void;
};

export function SendMessageModal({ recipient, open, onClose }: Props) {
  const router = useRouter();
  const [sendMessage, { isLoading: isSending }] = useSendDirectMessageMutation();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [sendError, setSendError] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SendDirectMessageInput>({
    resolver: zodResolver(sendDirectMessageSchema),
    mode: 'onChange',
    defaultValues: {
      recipientId: recipient?.id ?? '',
      text: '',
    },
  });

  useEffect(() => {
    if (open && recipient) {
      reset({ recipientId: recipient.id, text: '' });
      setSendError(false);
    }
  }, [open, recipient, reset]);

  if (!recipient) {
    return null;
  }

  const titleId = `send-message-title-${recipient.id}`;
  const isSubmitDisabled = !isValid || isSubmitting || isSending;

  const submitHandler = handleSubmit(async (values) => {
    setSendError(false);
    const result = await sendMessage(values);

    if (result.data) {
      onClose();
      setIsSnackbarOpen(true);
      return;
    }

    setSendError(true);
  });

  const shortcutKeyDownHandler = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void submitHandler();
    }
  };

  const messagesNavigationHandler = (): void => {
    setIsSnackbarOpen(false);
    router.push('/messages');
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby={titleId}
        slotProps={{
          paper: {
            sx: {
              m: { xxs: 1.5, sm: 3 },
              width: '100%',
              maxWidth: { xxs: 'calc(100% - 24px)', sm: 'calc(100% - 48px)' },
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogTitle
          id={titleId}
          sx={{ px: { xxs: 2, sm: 3 }, pt: { xxs: 2, sm: 3 }, pb: 1 }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', pr: 5, minWidth: 0 }}>
            <UserAvatar username={recipient.username} src={recipient.avatar} size={40} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
              Сообщение для {recipient.username}
            </Typography>
          </Stack>
          <IconButton
            aria-label="Закрыть"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={submitHandler}>
          <DialogContent sx={{ px: { xxs: 2, sm: 3 }, py: 1 }}>
            <input type="hidden" {...register('recipientId')} />
            {sendError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Не удалось отправить сообщение
              </Alert>
            ) : null}
            <TextField
              label="Текст сообщения"
              placeholder="Напишите сообщение..."
              multiline
              minRows={4}
              fullWidth
              autoFocus
              error={Boolean(errors.text)}
              helperText={errors.text?.message ?? 'Ctrl + Enter — отправить'}
              onKeyDown={shortcutKeyDownHandler}
              slotProps={{ htmlInput: { ...register('text'), maxLength: 2000 } }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: { xxs: 2, sm: 3 },
              pb: { xxs: 2, sm: 3 },
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ width: { xxs: '100%', sm: 'auto' } }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitDisabled}
              startIcon={isSending ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ width: { xxs: '100%', sm: 'auto' } }}
            >
              Отправить
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ maxWidth: { xxs: 'calc(100% - 24px)', sm: 600 }, width: '100%' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setIsSnackbarOpen(false)}
          action={
            <Button color="inherit" size="small" onClick={messagesNavigationHandler}>
              Перейти к диалогам
            </Button>
          }
          sx={{ width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
        >
          Сообщение отправлено
        </Alert>
      </Snackbar>
    </>
  );
}
