import { z } from 'zod';

import type { Prettify } from '../types/utils';

export const sendDirectMessageSchema = z.object({
  recipientId: z.string().min(1, 'Укажите получателя'),
  text: z
    .string()
    .trim()
    .min(1, 'Введите текст сообщения')
    .max(2000, 'Сообщение не должно превышать 2000 символов'),
});

export const sendConversationMessageSchema = z.object({
  conversationId: z.string().min(1, 'Укажите диалог'),
  text: z.string().trim().min(1, 'Введите сообщение').max(2000),
});

export const sendMessageSchema = z.union([sendDirectMessageSchema, sendConversationMessageSchema]);

export const messageDtoSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  text: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const typingEventSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
});

export const clearConversationMessagesResponseSchema = z.object({
  message: z.literal('Диалог очищен'),
});

export type SendDirectMessageInput = Prettify<z.infer<typeof sendDirectMessageSchema>>;
export type SendConversationMessageInput = Prettify<z.infer<typeof sendConversationMessageSchema>>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageDto = Prettify<z.infer<typeof messageDtoSchema>>;
export type TypingEvent = Prettify<z.infer<typeof typingEventSchema>>;
export type ClearConversationMessagesResponse = Prettify<
  z.infer<typeof clearConversationMessagesResponseSchema>
>;
