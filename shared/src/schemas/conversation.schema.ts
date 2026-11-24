import { z } from 'zod';

import type { Prettify } from '../types/utils';
import { publicUserDtoSchema } from './auth.schema';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

export const lastMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const conversationSchema = z.object({
  id: z.string(),
  participants: z.array(publicUserDtoSchema),
  lastMessage: lastMessageSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createConversationSchema = z.object({
  participantId: z
    .string()
    .regex(OBJECT_ID_PATTERN, 'Некорректный идентификатор пользователя'),
});

export const conversationUpdatedEventSchema = z.object({
  conversationId: z.string(),
  lastMessage: lastMessageSchema.nullable(),
  updatedAt: z.string(),
});

export const conversationClearedEventSchema = z.object({
  conversationId: z.string(),
});

export type LastMessageDto = Prettify<z.infer<typeof lastMessageSchema>>;
export type ConversationDto = Prettify<z.infer<typeof conversationSchema>>;
export type CreateConversationInput = Prettify<z.infer<typeof createConversationSchema>>;
export type ConversationUpdatedEvent = Prettify<z.infer<typeof conversationUpdatedEventSchema>>;
export type ConversationClearedEvent = Prettify<z.infer<typeof conversationClearedEventSchema>>;
