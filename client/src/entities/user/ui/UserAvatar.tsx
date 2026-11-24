'use client';

import Avatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';

type Props = {
  username: string;
  src?: string;
  size?: number;
};

export function UserAvatar({ username, src, size = 96 }: Props) {
  const sx: SxProps<Theme> = {
    width: size,
    height: size,
    bgcolor: 'primary.main',
    fontSize: size / 2.6,
  };

  return (
    <Avatar src={src || undefined} alt={username} sx={sx}>
      {username.charAt(0).toUpperCase()}
    </Avatar>
  );
}
