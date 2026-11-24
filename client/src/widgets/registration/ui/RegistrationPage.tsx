'use client';

import type { AuthResponse } from '@social/shared';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { RegistrationForm, VerificationForm } from '@/features/auth';

type Props = {
  onAuthenticated: (auth: AuthResponse) => void;
};

type RegistrationStep = 'register' | 'verify';

export function RegistrationPage({ onAuthenticated }: Props) {
  const [step, setStep] = useState<RegistrationStep>('register');
  const [email, setEmail] = useState('');

  const registeredHandler = (registeredEmail: string): void => {
    setEmail(registeredEmail);
    setStep('verify');
  };

  const isVerifyStep = step === 'verify';

  return (
    <Paper
      elevation={2}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: { xxs: 2, sm: 4 },
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
            {isVerifyStep ? 'Подтверждение почты' : 'Создать аккаунт'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {isVerifyStep
              ? `Введите 6-значный код, отправленный на ${email}`
              : 'Присоединяйтесь к социальной сети и делитесь моментами с друзьями'}
          </Typography>
        </Stack>
        {isVerifyStep ? (
          <VerificationForm email={email} onVerified={onAuthenticated} />
        ) : (
          <RegistrationForm onRegistered={registeredHandler} />
        )}
      </Stack>
    </Paper>
  );
}
