import type {
  AuthResponse,
  LoginInput,
  Prettify,
  RegisterInput,
  RegisterResponse,
  ResendCodeInput,
  UserDto,
  VerifyEmailInput,
} from '@social/shared';
import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';

import { UserModel, type UserDocument } from '../models';
import { ApiError, generateTokenPair, verifyRefreshToken } from '../utils';
import { sendVerificationCode } from './mail.service';

const BCRYPT_SALT_ROUNDS = 10;
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_SENT_MESSAGE = 'Код подтверждения отправлен на почту';
const RESEND_CODE_MESSAGE = 'Новый код отправлен';
const INVALID_CODE_MESSAGE = 'Неверный или просроченный код подтверждения';
const EMAIL_IN_USE_MESSAGE = 'Эта электронная почта уже используется';
const USERNAME_IN_USE_MESSAGE = 'Это имя пользователя уже занято';
const INVALID_CREDENTIALS_MESSAGE = 'Неверная электронная почта или пароль';
const UNVERIFIED_EMAIL_MESSAGE = 'Подтвердите электронную почту перед входом';
const UNVERIFIED_USER_NOT_FOUND_MESSAGE =
  'Неподтверждённый пользователь с такой электронной почтой не найден';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Недействительный или просроченный токен обновления';
const USER_NOT_FOUND_MESSAGE = 'Пользователь не найден';

type AuthResult = Prettify<AuthResponse & { refreshToken: string }>;
type RegisterResult = Prettify<RegisterResponse & { statusCode: number }>;

function toUserDto(user: UserDocument): UserDto {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    avatar: user.avatar,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    createdAt: user.createdAt.toISOString(),
  };
}

function createAuthResult(user: UserDocument): AuthResult {
  const tokens = generateTokenPair(String(user._id));

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toUserDto(user),
  };
}

async function issueVerificationCode(user: UserDocument): Promise<void> {
  const code = randomInt(100000, 1000000).toString();

  user.verificationCodeHash = await bcrypt.hash(code, BCRYPT_SALT_ROUNDS);
  user.verificationCodeExpires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);
  await user.save();

  await sendVerificationCode(user.email, code);
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { email: rawEmail, username: rawUsername, password } = input;
  const email = rawEmail.trim().toLowerCase();
  const username = rawUsername.trim();
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const existingUser = await UserModel.findOne({ email });

  if (existingUser?.isVerified) {
    throw new ApiError(409, EMAIL_IN_USE_MESSAGE);
  }

  const isUsernameTaken = await UserModel.exists({
    username,
    ...(existingUser ? { _id: { $ne: existingUser._id } } : {}),
  }).collation({ locale: 'en', strength: 2 });

  if (isUsernameTaken) {
    throw new ApiError(409, USERNAME_IN_USE_MESSAGE);
  }

  if (existingUser) {
    existingUser.username = username;
    existingUser.passwordHash = passwordHash;
    await issueVerificationCode(existingUser);

    return { email, message: VERIFICATION_SENT_MESSAGE, statusCode: 200 };
  }

  const user = await UserModel.create({ email, username, passwordHash });
  await issueVerificationCode(user);

  return { email, message: VERIFICATION_SENT_MESSAGE, statusCode: 201 };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
  }

  if (!user.isVerified) {
    throw new ApiError(403, UNVERIFIED_EMAIL_MESSAGE);
  }

  return createAuthResult(user);
}

export async function verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email }).select(
    '+verificationCodeHash +verificationCodeExpires',
  );

  if (!user || user.isVerified) {
    throw new ApiError(400, INVALID_CODE_MESSAGE);
  }

  const expiresAt = user.verificationCodeExpires;
  const codeHash = user.verificationCodeHash;

  if (!expiresAt || expiresAt <= new Date() || !codeHash) {
    throw new ApiError(400, INVALID_CODE_MESSAGE);
  }

  const isCodeValid = await bcrypt.compare(input.code, codeHash);

  if (!isCodeValid) {
    throw new ApiError(400, INVALID_CODE_MESSAGE);
  }

  user.isVerified = true;
  user.verificationCodeHash = null;
  user.verificationCodeExpires = null;
  await user.save();

  return createAuthResult(user);
}

export async function resendVerificationCode(input: ResendCodeInput): Promise<{ message: string }> {
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email });

  if (!user || user.isVerified) {
    throw new ApiError(404, UNVERIFIED_USER_NOT_FOUND_MESSAGE);
  }

  await issueVerificationCode(user);

  return { message: RESEND_CODE_MESSAGE };
}

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  const user = await UserModel.findById(payload.userId);

  if (!user) {
    throw new ApiError(401, INVALID_REFRESH_TOKEN_MESSAGE);
  }

  return createAuthResult(user);
}

export async function getUserDto(userId: string): Promise<UserDto> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(401, USER_NOT_FOUND_MESSAGE);
  }

  return toUserDto(user);
}
