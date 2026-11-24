import type { SendMessageInput } from '@social/shared';
import type { RequestHandler } from 'express';

import {
  clearConversationMessages,
  getConversationMessages,
  getConversationParticipantIds,
  sendMessage,
} from '../services';
import { emitConversationCleared, emitMessageCreated } from '../sockets';
import { getAuthenticatedUserId } from '../utils';

export const getConversationMessagesController: RequestHandler = async (request, response, next) => {
  try {
    const rawConversationId = request.params.id;
    const conversationId = Array.isArray(rawConversationId)
      ? (rawConversationId[0] ?? '')
      : (rawConversationId ?? '');
    const messages = await getConversationMessages({
      userId: getAuthenticatedUserId(request),
      conversationId,
    });

    response.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const clearConversationMessagesController: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const rawConversationId = request.params.id;
    const conversationId = Array.isArray(rawConversationId)
      ? (rawConversationId[0] ?? '')
      : (rawConversationId ?? '');
    const participantIds = await clearConversationMessages(
      getAuthenticatedUserId(request),
      conversationId,
    );

    emitConversationCleared(conversationId, participantIds);
    response.status(200).json({ message: 'Диалог очищен' });
  } catch (error) {
    next(error);
  }
};

export const sendMessageController: RequestHandler = async (request, response, next) => {
  try {
    const message = await sendMessage({
      userId: getAuthenticatedUserId(request),
      ...(request.body as SendMessageInput),
    });
    const participantIds = await getConversationParticipantIds(message.conversationId);

    emitMessageCreated(message, participantIds);
    response.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
