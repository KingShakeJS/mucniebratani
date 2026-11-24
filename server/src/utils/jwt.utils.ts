import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type TokenType = 'access' | 'refresh';

type TokenPayload = {
  userId: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

function signToken(
  userId: string,
  tokenType: TokenType,
  secret: string,
  expiresIn: SignOptions['expiresIn'],
): string {
  return jwt.sign({ userId, tokenType }, secret, { expiresIn });
}

function verifyToken(token: string, secret: string, expectedTokenType: TokenType): TokenPayload | null {
  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === 'string') {
      return null;
    }

    const { tokenType, userId } = payload;

    if (tokenType !== expectedTokenType || typeof userId !== 'string') {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export function generateAccessToken(userId: string): string {
  return signToken(userId, 'access', env.jwtAccessSecret, '15m');
}

export function generateRefreshToken(userId: string): string {
  return signToken(userId, 'refresh', env.jwtRefreshSecret, '7d');
}

export function generateTokenPair(userId: string): TokenPair {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  return verifyToken(token, env.jwtAccessSecret, 'access');
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  return verifyToken(token, env.jwtRefreshSecret, 'refresh');
}
