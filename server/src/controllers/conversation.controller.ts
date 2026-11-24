import type { CreateConversationInput } from '@social/shared';
import type { RequestHandler } from 'express';

import { createConversation, getConversations } from '../services';
import { getAuthenticatedUserId } from '../utils';

export const getConversationsController: RequestHandler = async (request, response, next) => {
  try {
    const conversations = await getConversations(getAuthenticatedUserId(request));

    response.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const createConversationController: RequestHandler = async (request, response, next) => {
  try {
    const conversation = await createConversation({
      userId: getAuthenticatedUserId(request),
      ...(request.body as CreateConversationInput),
    });

    response.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};
