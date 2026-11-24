import DoneAllIcon from '@mui/icons-material/DoneAll';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { MessageDto } from '@social/shared';

import { formatMessageClockTime } from '@/entities/message';

type Props = {
  message: MessageDto;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: { xxs: '88%', sm: '70%' },
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: isOwn ? 'primary.main' : 'background.default',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          border: isOwn ? 'none' : '1px solid',
          borderColor: 'divider',
          borderTopRightRadius: isOwn ? 4 : 16,
          borderTopLeftRadius: isOwn ? 16 : 4,
        }}
      >
        <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.text}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ color: isOwn ? 'primary.contrastText' : 'text.secondary', opacity: 0.75 }}
          >
            {formatMessageClockTime(message.createdAt)}
          </Typography>
          {isOwn && message.isRead ? <DoneAllIcon sx={{ fontSize: 14 }} /> : null}
        </Stack>
      </Box>
    </Box>
  );
}
