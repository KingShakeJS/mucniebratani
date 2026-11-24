import type {
  ConversationDto,
  CreateConversationInput,
  LastMessageDto,
  PublicUserDto,
  UserRole,
} from '@social/shared';
import { Types } from 'mongoose';

import { ConversationModel, UserModel } from '../models';
import { ApiError } from '../utils';

const USER_NOT_FOUND_MESSAGE = 'Пользователь не найден';
const AUTH_REQUIRED_MESSAGE = 'Требуется авторизация';
const SELF_CONVERSATION_MESSAGE = 'Нельзя создать диалог с собой';
const CONVERSATION_NOT_FOUND_MESSAGE = 'Диалог не найден';
const PARTICIPANT_FIELDS = 'username role avatar bio followers following createdAt';

type ConversationParticipant = {
  _id: Types.ObjectId;
  username: string;
  role: UserRole;
  avatar: string;
  bio: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  createdAt: Date;
};

type ConversationLastMessage = {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PopulatedConversation = {
  _id: Types.ObjectId;
  participants: ConversationParticipant[];
  lastMessage: ConversationLastMessage | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreateConversationParams = CreateConversationInput & {
  userId: string;
};

function toPublicUserDto(user: ConversationParticipant): PublicUserDto {
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

function toLastMessageDto(message: ConversationLastMessage | null): LastMessageDto | null {
  if (!message) {
    return null;
  }

  return {
    id: String(message._id),
    senderId: String(message.sender),
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

function toConversationDto(conversation: PopulatedConversation): ConversationDto {
  return {
    id: String(conversation._id),
    participants: conversation.participants.map(toPublicUserDto),
    lastMessage: toLastMessageDto(conversation.lastMessage),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function getConversations(userId: string): Promise<ConversationDto[]> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, AUTH_REQUIRED_MESSAGE);
  }

  const conversations = await ConversationModel.find({ participants: userId })
    .populate({ path: 'participants', select: PARTICIPANT_FIELDS })
    .populate({ path: 'lastMessage' })
    .sort({ updatedAt: -1 })
    .lean<PopulatedConversation[]>();

  return conversations.map(toConversationDto);
}

export async function findOrCreateConversationId(
  userId: string,
  participantId: string,
): Promise<Types.ObjectId> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, AUTH_REQUIRED_MESSAGE);
  }

  if (!Types.ObjectId.isValid(participantId)) {
    throw new ApiError(404, USER_NOT_FOUND_MESSAGE);
  }

  const currentUserId = new Types.ObjectId(userId);
  const participantUserId = new Types.ObjectId(participantId);

  if (currentUserId.equals(participantUserId)) {
    throw new ApiError(400, SELF_CONVERSATION_MESSAGE);
  }

  const participantExists = await UserModel.exists({ _id: participantUserId, isVerified: true });

  if (!participantExists) {
    throw new ApiError(404, USER_NOT_FOUND_MESSAGE);
  }

  const conversation = await ConversationModel.findOne({
    participants: { $all: [currentUserId, participantUserId], $size: 2 },
  })
    .select('_id')
    .lean<{ _id: Types.ObjectId } | null>();

  if (conversation) {
    return conversation._id;
  }

  const createdConversation = await ConversationModel.create({
    participants: [currentUserId, participantUserId],
  });

  return createdConversation._id;
}

export async function isUserConversationParticipant(
  userId: string,
  conversationId: string,
): Promise<boolean> {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(conversationId)) {
    return false;
  }

  const conversation = await ConversationModel.exists({
    _id: conversationId,
    participants: userId,
  });

  return conversation !== null;
}

export async function getConversationIdForParticipant(
  userId: string,
  conversationId: string,
): Promise<Types.ObjectId> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, AUTH_REQUIRED_MESSAGE);
  }

  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(404, CONVERSATION_NOT_FOUND_MESSAGE);
  }

  const isParticipant = await isUserConversationParticipant(userId, conversationId);

  if (!isParticipant) {
    throw new ApiError(404, CONVERSATION_NOT_FOUND_MESSAGE);
  }

  return new Types.ObjectId(conversationId);
}

export async function getConversationParticipantIds(conversationId: string): Promise<string[]> {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(404, CONVERSATION_NOT_FOUND_MESSAGE);
  }

  const conversation = await ConversationModel.findById(conversationId)
    .select('participants')
    .lean<{ participants: Types.ObjectId[] } | null>();

  if (!conversation) {
    throw new ApiError(404, CONVERSATION_NOT_FOUND_MESSAGE);
  }

  return conversation.participants.map(String);
}

export async function createConversation({
  userId,
  participantId,
}: CreateConversationParams): Promise<ConversationDto> {
  const conversationId = await findOrCreateConversationId(userId, participantId);
  const conversation = await ConversationModel.findById(conversationId)
    .populate({ path: 'participants', select: PARTICIPANT_FIELDS })
    .populate({ path: 'lastMessage' })
    .lean<PopulatedConversation | null>();

  if (!conversation) {
    throw new ApiError(404, CONVERSATION_NOT_FOUND_MESSAGE);
  }

  return toConversationDto(conversation);
}
