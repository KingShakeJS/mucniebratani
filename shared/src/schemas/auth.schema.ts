import { z } from 'zod';

import type { Prettify } from '../types/utils';

const INVALID_EMAIL_MESSAGE = 'Введите корректный email';
const INVALID_LOGIN_EMAIL_MESSAGE = 'Некорректный формат электронной почты';
const USERNAME_MIN_LENGTH_MESSAGE = 'Имя пользователя должно содержать минимум 3 символа';
const USERNAME_MAX_LENGTH_MESSAGE = 'Имя пользователя должно содержать не более 15 символов';
const USERNAME_NO_SPACES_MESSAGE = 'Имя пользователя не должно содержать пробелы';
const PASSWORD_LENGTH_MESSAGE = 'Пароль должен содержать минимум 6 символов';
const CONFIRM_PASSWORD_REQUIRED_MESSAGE = 'Подтвердите пароль';
const PASSWORDS_MISMATCH_MESSAGE = 'Пароли не совпадают';

export const USER_ROLES = ['user', 'admin', 'superadmin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, USERNAME_MIN_LENGTH_MESSAGE)
      .max(15, USERNAME_MAX_LENGTH_MESSAGE)
      .regex(/^[^\s]+$/, USERNAME_NO_SPACES_MESSAGE),
    email: z.string().trim().email(INVALID_EMAIL_MESSAGE),
    password: z.string().min(6, PASSWORD_LENGTH_MESSAGE),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED_MESSAGE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: PASSWORDS_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email(INVALID_LOGIN_EMAIL_MESSAGE),
  password: z.string().min(1, 'Введите пароль'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(INVALID_LOGIN_EMAIL_MESSAGE),
  code: z.string().regex(/^\d{6}$/, 'Код должен состоять из 6 цифр'),
});

export const resendCodeSchema = z.object({
  email: z.string().email(INVALID_LOGIN_EMAIL_MESSAGE),
});

export const registerResponseSchema = z.object({
  email: z.string(),
  message: z.string(),
});

export const userDtoSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  avatar: z.string(),
  bio: z.string(),
  followersCount: z.number(),
  followingCount: z.number(),
  createdAt: z.string(),
});

export const publicUserDtoSchema = userDtoSchema.omit({ email: true });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = Prettify<z.infer<typeof verifyEmailSchema>>;
export type ResendCodeInput = Prettify<z.infer<typeof resendCodeSchema>>;
export type RegisterResponse = Prettify<z.infer<typeof registerResponseSchema>>;
export type UserDto = Prettify<z.infer<typeof userDtoSchema>>;
export type PublicUserDto = Prettify<z.infer<typeof publicUserDtoSchema>>;

export type AuthResponse = Prettify<{
  accessToken: string;
  user: UserDto;
}>;
