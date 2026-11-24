'use client';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterInput } from '@social/shared';
import { registerSchema } from '@social/shared';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRegisterMutation } from '../api/authApi';
import { getErrorMessage } from '../lib/getErrorMessage';

const DEFAULT_DEV_EMAIL =
  process.env.NODE_ENV === 'development' ? 'boris.lyudochka@yandex.ru' : '';

type Props = {
  onRegistered: (email: string) => void;
};

export function RegistrationForm({ onRegistered }: Props) {
  const [registerUser, { error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: DEFAULT_DEV_EMAIL,
      password: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibilityHandler = (): void => {
    setShowPassword((currentValue) => !currentValue);
  };

  const toggleConfirmPasswordVisibilityHandler = (): void => {
    setShowConfirmPassword((currentValue) => !currentValue);
  };

  const submitHandler = handleSubmit(async (values) => {
    const result = await registerUser(values);

    if (result.data) {
      onRegistered(result.data.email);
    }
  });

  return (
    <Box component="form" onSubmit={submitHandler} noValidate>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {error ? <Alert severity="error">{getErrorMessage(error)}</Alert> : null}
        <TextField
          label="Имя пользователя"
          autoComplete="username"
          fullWidth
          slotProps={{ htmlInput: register('username') }}
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
        />
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
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          fullWidth
          slotProps={{
            htmlInput: register('password'),
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={togglePasswordVisibilityHandler}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <TextField
          label="Подтвердите пароль"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          fullWidth
          slotProps={{
            htmlInput: register('confirmPassword'),
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={toggleConfirmPasswordVisibilityHandler}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Создать аккаунт'
          )}
        </Button>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </Typography>
      </Box>
    </Box>
  );
}
