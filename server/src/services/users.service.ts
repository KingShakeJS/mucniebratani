import type { PublicUserDto, UserDto } from '@social/shared';
import { Types } from 'mongoose';

import { UserModel, type UserDocument } from '../models';
import { ApiError } from '../utils';

const USER_NOT_FOUND_MESSAGE = 'Пользователь не найден';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toUserDto(user: UserDocument): PublicUserDto {
  return {
    id: String(user._id),
    username: user.username,
    role: user.role || 'user',
    avatar: user.avatar,
    bio: user.bio,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    createdAt: user.createdAt.toISOString(),
  };
}

function toFullUserDto(user: UserDocument): UserDto {
  return {
    ...toUserDto(user),
    email: user.email,
  };
}

export async function getUsers(search?: string): Promise<UserDto[]> {
  const filter = {
    isVerified: true,
    ...(search
      ? { username: { $regex: escapeRegExp(search), $options: 'i' } }
      : {}),
  };
  const users = await UserModel.find(filter).sort({ createdAt: 1 });

  return users.map(toFullUserDto);
}

export async function getPublicUser(userId: string): Promise<PublicUserDto> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, USER_NOT_FOUND_MESSAGE);
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, USER_NOT_FOUND_MESSAGE);
  }

  return toUserDto(user);
}
