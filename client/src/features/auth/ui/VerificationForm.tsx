'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AuthResponse, VerifyEmailInput } from '@social/shared';
import { verifyEmailSchema } from '@social/shared';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useResendCodeMutation, useVerifyEmailMutation } from '../api/authApi';
import { getErrorMessage } from '../lib/getErrorMessage';

const RESEND_DELAY_SECONDS = 60;
const CODE_LENGTH = 6;

type Props = {
  email: string;
  onVerified: (auth: AuthResponse) => void;
};

export function VerificationForm({ email, onVerified }: Props) {
  const router = useRouter();
  const [verifyCode, { isLoading: isVerifying, error: verifyError }] = useVerifyEmailMutation();
  const [resendCode, { isLoading: isResending, error: resendError, data: resendData }] =
    useResendCodeMutation();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_DELAY_SECONDS);
  const codeInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email,
      code: '',
    },
  });
  const code = useWatch({ control, name: 'code' }) ?? '';
  const codeDigits = Array.from({ length: CODE_LENGTH }, (_, index) => code[index] ?? '');

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((currentValue) => currentValue - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [secondsLeft]);

  const digitChangeHandler = (index: number, value: string): void => {
    const sanitizedValue = value.replace(/\D/g, '').slice(-1);
    const nextDigits = code.padEnd(CODE_LENGTH, ' ').split('');

    nextDigits[index] = sanitizedValue;
    setValue('code', nextDigits.join('').replace(/\s/g, ''), { shouldValidate: true });

    if (sanitizedValue && index < CODE_LENGTH - 1) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const digitKeyDownHandler = (index: number, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const submitHandler = handleSubmit(async (values) => {
    const result = await verifyCode(values);

    if (result.data) {
      onVerified(result.data);
      router.push(`/profile/${result.data.user.id}`);
    }
  });

  const resendCodeHandler = async (): Promise<void> => {
    const result = await resendCode({ email });

    if (result.data) {
      setSecondsLeft(RESEND_DELAY_SECONDS);
    }
  };

  return (
    <Box component="form" onSubmit={submitHandler} noValidate>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <input type="hidden" {...register('email')} />
        {verifyError ? <Alert severity="error">{getErrorMessage(verifyError)}</Alert> : null}
        {resendError ? <Alert severity="error">{getErrorMessage(resendError)}</Alert> : null}
        {resendData ? <Alert severity="success">{resendData.message}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Stack
            direction="row"
            spacing={{ xxs: 0.5, xs: 0.75, sm: 1.5 }}
            useFlexGap
            sx={{ justifyContent: 'center' }}
          >
            {codeDigits.map((digit, index) => (
              <TextField
                key={index}
                value={digit}
                error={Boolean(errors.code)}
                onChange={(event) => digitChangeHandler(index, event.target.value)}
                inputRef={(element) => {
                  codeInputsRef.current[index] = element;
                }}
                sx={{
                  width: { xxs: 36, xs: 42, sm: 48 },
                  '& .MuiInputBase-root': {
                    height: { xxs: 44, xs: 48, sm: 52 },
                  },
                  '& .MuiInputBase-input': {
                    p: 0,
                    textAlign: 'center',
                    fontSize: { xxs: '1rem', xs: '1.1rem', sm: '1.25rem' },
                  },
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    autoComplete: index === 0 ? 'one-time-code' : 'off',
                    autoFocus: index === 0,
                    maxLength: 1,
                    'aria-label': `Цифра ${index + 1}`,
                    onFocus: (event: FocusEvent<HTMLInputElement>) => event.target.select(),
                    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) =>
                      digitKeyDownHandler(index, event),
                  },
                }}
              />
            ))}
          </Stack>
          <Typography
            variant="caption"
            color={errors.code ? 'error' : 'text.secondary'}
            sx={{ textAlign: 'center' }}
          >
            {errors.code?.message ?? 'Код состоит из 6 цифр'}
          </Typography>
        </Box>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={isVerifying}>
          {isVerifying ? <CircularProgress size={24} color="inherit" /> : 'Подтвердить'}
        </Button>
        <Button
          type="button"
          variant="text"
          fullWidth
          onClick={resendCodeHandler}
          disabled={secondsLeft > 0 || isResending}
        >
          {isResending ? (
            <CircularProgress size={20} color="inherit" />
          ) : secondsLeft > 0 ? (
            `Отправить код повторно через ${secondsLeft} с`
          ) : (
            'Отправить код повторно'
          )}
        </Button>
      </Box>
    </Box>
  );
}
