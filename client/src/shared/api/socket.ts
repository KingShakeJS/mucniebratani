'use client';

import type {
  ConversationClearedEvent,
  ConversationUpdatedEvent,
  MessageDto,
  TypingEvent,
} from '@social/shared';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

type SocketEventName =
  | 'message:new'
  | 'conversation:updated'
  | 'conversation:cleared'
  | 'typing:start'
  | 'typing:stop';

type SocketEventMap = {
  'message:new': MessageDto;
  'conversation:updated': ConversationUpdatedEvent;
  'conversation:cleared': ConversationClearedEvent;
  'typing:start': TypingEvent;
  'typing:stop': TypingEvent;
};

type SocketEventHandler = (payload: unknown, ...rest: unknown[]) => void;

let socket: Socket | null = null;
let currentToken: string | null = null;
const listeners = new Map<SocketEventName, Set<SocketEventHandler>>();
const joinedConversationIds = new Set<string>();

function attachListeners(instance: Socket): void {
  listeners.forEach((handlers, event) => {
    handlers.forEach((handler) => {
      instance.on(event, handler as never);
    });
  });
}

function detachListeners(instance: Socket): void {
  listeners.forEach((handlers, event) => {
    handlers.forEach((handler) => {
      instance.off(event, handler as never);
    });
  });
}

export function setSocketAccessToken(token: string | null): void {
  if (token === currentToken) {
    return;
  }

  if (socket) {
    detachListeners(socket);
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  if (!token) {
    return;
  }

  const nextSocket = io(SOCKET_URL, { auth: { token } });

  nextSocket.on('connect', () => {
    joinedConversationIds.forEach((conversationId) => {
      nextSocket.emit('conversation:join', conversationId);
    });
  });

  attachListeners(nextSocket);
  socket = nextSocket;
}

export function subscribeToSocket<EventName extends SocketEventName>(
  event: EventName,
  handler: (payload: SocketEventMap[EventName]) => void,
): () => void {
  const wrappedHandler: SocketEventHandler = (payload) => {
    handler(payload as SocketEventMap[EventName]);
  };
  const handlers = listeners.get(event) ?? new Set<SocketEventHandler>();

  handlers.add(wrappedHandler);
  listeners.set(event, handlers);
  socket?.on(event, wrappedHandler as never);

  return () => {
    handlers.delete(wrappedHandler);
    socket?.off(event, wrappedHandler as never);
  };
}

export function joinConversationRoom(conversationId: string): void {
  joinedConversationIds.add(conversationId);
  socket?.emit('conversation:join', conversationId);
}

export function leaveConversationRoom(conversationId: string): void {
  joinedConversationIds.delete(conversationId);
  socket?.emit('conversation:leave', conversationId);
}

export function emitTypingEvent(payload: TypingEvent, isTyping: boolean): void {
  socket?.emit(isTyping ? 'typing:start' : 'typing:stop', payload);
}
