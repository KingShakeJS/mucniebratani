import type {
  LoginInput,
  RegisterInput,
  ResendCodeInput,
  VerifyEmailInput,
} from '@social/shared';
import type { RequestHandler, Response } from 'express';

import { env } from '../config';
import {
  getUserDto,
  loginUser,
  refreshTokens,
  registerUser,
  resendVerificationCode,
  verifyEmail,
} from '../services';
import {
  ApiError,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../utils';

const REFRESH_TOKEN_COOKIE_PATH = '/api/auth';

function setRefreshTokenCookie(response: Response, refreshToken: string): void {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

function clearRefreshTokenCookie(response: Response): void {
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: REFRESH_TOKEN_COOKIE_PATH,
  });
}

export const registerController: RequestHandler = async (request, response, next) => {
  try {
    const result = await registerUser(request.body as RegisterInput);

    response.status(result.statusCode).json({ email: result.email, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const result = await loginUser(request.body as LoginInput);

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailController: RequestHandler = async (request, response, next) => {
  try {
    const result = await verifyEmail(request.body as VerifyEmailInput);

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const resendCodeController: RequestHandler = async (request, response, next) => {
  try {
    const result = await resendVerificationCode(request.body as ResendCodeInput);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const refreshController: RequestHandler = async (request, response, next) => {
  try {
    const refreshToken: unknown = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new ApiError(401, 'Токен обновления отсутствует');
    }

    const result = await refreshTokens(refreshToken);

    setRefreshTokenCookie(response, result.refreshToken);
    response.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = (request, response) => {
  void request;
  clearRefreshTokenCookie(response);
  response.status(200).json({ message: 'Вы вышли из аккаунта' });
};

export const meController: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Требуется авторизация');
    }

    const user = await getUserDto(userId);

    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
