'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthResponse, LoginInput } from '@social/shared';
import { loginSchema } from '@social/shared';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '../api/authApi';
import { getErrorMessage } from '../lib/getErrorMessage';

const DEFAULT_DEV_EMAIL =
  process.env.NODE_ENV === 'development' ? 'boris.lyudochka@yandex.ru' : '';

type Props = {
  onAuthenticated: (auth: AuthResponse) => void;
};

export function LoginForm({ onAuthenticated }: Props) {
  const [loginUser, { error }] = useLoginMutation();
  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: DEFAULT_DEV_EMAIL,
      password: '',
    },
  });

  const submitHandler = handleSubmit(async (values) => {
    const result = await loginUser(values);

    if (result.data) {
      onAuthenticated(result.data);
    }
  });

  return (
    <Box component="form" onSubmit={submitHandler} noValidate>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {error ? <Alert severity="error">{getErrorMessage(error)}</Alert> : null}
        <TextField
          label="Электронная почта"
          type="email"
          autoComplete="email"
          fullWidth
          slotProps={{
            htmlInput: {
              ...register('email'),
              defaultValue: DEFAULT_DEV_EMAIL,
            },
          }}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          label="Пароль"
          type="password"
          autoComplete="current-password"
          fullWidth
          slotProps={{ htmlInput: register('password') }}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
        </Button>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
        </Typography>
      </Box>
    </Box>
  );
}
