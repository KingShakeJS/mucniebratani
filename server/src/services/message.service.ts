import type { MessageDto, SendMessageInput } from '@social/shared';
import { Types } from 'mongoose';

import { ConversationModel, MessageModel, type MessageFields } from '../models';
import { ApiError } from '../utils';
import {
  findOrCreateConversationId,
  getConversationIdForParticipant,
  getConversationParticipantIds,
} from './conversation.service';

type SendMessageParams = SendMessageInput & {
  userId: string;
};

type GetConversationMessagesParams = {
  userId: string;
  conversationId: string;
};

type MessageRecord = MessageFields & { _id: Types.ObjectId };

function toMessageDto(message: MessageRecord): MessageDto {
  return {
    id: String(message._id),
    conversationId: String(message.conversation),
    senderId: String(message.sender),
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function sendMessage(params: SendMessageParams): Promise<MessageDto> {
  const { userId, text } = params;

  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, 'Требуется авторизация');
  }

  const conversationId =
    'conversationId' in params
      ? await getConversationIdForParticipant(userId, params.conversationId)
      : await findOrCreateConversationId(userId, params.recipientId);

  const message = await MessageModel.create({
    conversation: conversationId,
    sender: new Types.ObjectId(userId),
    text,
  });

  await ConversationModel.findByIdAndUpdate(conversationId, {
    $set: { lastMessage: message._id, updatedAt: new Date() },
  });

  return toMessageDto(message);
}

export async function getConversationMessages({
  userId,
  conversationId,
}: GetConversationMessagesParams): Promise<MessageDto[]> {
  await getConversationIdForParticipant(userId, conversationId);

  await MessageModel.updateMany(
    {
      conversation: new Types.ObjectId(conversationId),
      sender: { $ne: new Types.ObjectId(userId) },
      isRead: false,
    },
    { $set: { isRead: true } },
  );

  const messages = await MessageModel.find({ conversation: conversationId })
    .sort({ createdAt: 1, _id: 1 })
    .lean<MessageRecord[]>();

  return messages.map(toMessageDto);
}

export async function clearConversationMessages(
  userId: string,
  conversationId: string,
): Promise<string[]> {
  await getConversationIdForParticipant(userId, conversationId);
  const participantIds = await getConversationParticipantIds(conversationId);

  await MessageModel.deleteMany({ conversation: new Types.ObjectId(conversationId) });
  await ConversationModel.findByIdAndUpdate(conversationId, {
    $set: { lastMessage: null, updatedAt: new Date() },
  });

  return participantIds;
}
