import type {
  ConversationClearedEvent,
  ConversationUpdatedEvent,
  LastMessageDto,
  MessageDto,
  TypingEvent,
} from '@social/shared';
import { typingEventSchema } from '@social/shared';
import type { Server as SocketServer, Socket } from 'socket.io';

import { isUserConversationParticipant } from '../services/conversation.service';
import { verifyAccessToken } from '../utils';

const userSocketIds = new Map<string, Set<string>>();
let socketServer: SocketServer | null = null;

function userRoom(userId: string): string {
  return `user:${userId}`;
}

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

function getSocketUserId(socket: Socket): string {
  const userId: unknown = socket.data.userId;

  return typeof userId === 'string' ? userId : '';
}

function toLastMessageDto(message: MessageDto): LastMessageDto {
  return {
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt,
    updatedAt: message.createdAt,
  };
}

export function emitConversationMessage(message: MessageDto): void {
  socketServer?.to(conversationRoom(message.conversationId)).emit('message:new', message);
}

export function emitConversationUpdated(
  event: ConversationUpdatedEvent,
  participantIds: string[],
): void {
  participantIds.forEach((participantId) => {
    socketServer?.to(userRoom(participantId)).emit('conversation:updated', event);
  });
}

export function emitMessageCreated(message: MessageDto, participantIds: string[]): void {
  emitConversationMessage(message);
  emitConversationUpdated(
    {
      conversationId: message.conversationId,
      lastMessage: toLastMessageDto(message),
      updatedAt: message.createdAt,
    },
    participantIds,
  );
}

export function emitConversationCleared(conversationId: string, participantIds: string[]): void {
  const event: ConversationClearedEvent = { conversationId };

  socketServer?.to(conversationRoom(conversationId)).emit('conversation:cleared', event);
  emitConversationUpdated(
    {
      conversationId,
      lastMessage: null,
      updatedAt: new Date().toISOString(),
    },
    participantIds,
  );
}

export function registerSocketHandlers(io: SocketServer): void {
  socketServer = io;

  io.use((socket, next) => {
    const authToken: unknown = socket.handshake.auth.token;
    const token = typeof authToken === 'string' ? authToken : '';
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
      next(new Error('Не авторизован'));
      return;
    }

    socket.data.userId = payload.userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = getSocketUserId(socket);
    const socketIds = userSocketIds.get(userId) ?? new Set<string>();

    socketIds.add(socket.id);
    userSocketIds.set(userId, socketIds);
    socket.join(userRoom(userId));
    socket.emit('connected', { status: 'ok' });

    socket.on('conversation:join', (conversationId: unknown) => {
      if (typeof conversationId !== 'string') {
        return;
      }

      void isUserConversationParticipant(userId, conversationId)
        .then((isParticipant) => {
          if (isParticipant) {
            socket.join(conversationRoom(conversationId));
          }
        })
        .catch(() => undefined);
    });

    socket.on('conversation:leave', (conversationId: unknown) => {
      if (typeof conversationId !== 'string') {
        return;
      }

      void socket.leave(conversationRoom(conversationId));
    });

    const handleTyping = (eventName: 'typing:start' | 'typing:stop', payload: unknown): void => {
      const parsed = typingEventSchema.safeParse(payload);

      if (!parsed.success) {
        return;
      }

      const event: TypingEvent = {
        conversationId: parsed.data.conversationId,
        userId,
      };

      void isUserConversationParticipant(userId, event.conversationId)
        .then((isParticipant) => {
          if (isParticipant) {
            socket.to(conversationRoom(event.conversationId)).emit(eventName, event);
          }
        })
        .catch(() => undefined);
    };

    socket.on('typing:start', (payload: unknown) => {
      handleTyping('typing:start', payload);
    });

    socket.on('typing:stop', (payload: unknown) => {
      handleTyping('typing:stop', payload);
    });

    socket.on('disconnect', () => {
      socketIds.delete(socket.id);

      if (socketIds.size === 0) {
        userSocketIds.delete(userId);
      }
    });
  });
}
