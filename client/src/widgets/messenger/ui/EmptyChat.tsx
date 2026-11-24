import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function EmptyChat() {
  return (
    <Stack
      sx={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        display: { xxs: 'none', md: 'flex' },
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 1 }}>
        <ChatBubbleOutlinedIcon sx={{ fontSize: 52 }} />
      </Box>
      <Typography variant="h6">Выберите диалог</Typography>
      <Typography variant="body2" color="text.secondary">
        Ваши сообщения появятся здесь
      </Typography>
    </Stack>
  );
}
