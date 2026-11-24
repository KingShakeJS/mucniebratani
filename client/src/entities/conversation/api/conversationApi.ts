import type {
  ConversationDto,
  ConversationUpdatedEvent,
  CreateConversationInput,
  LastMessageDto,
  MessageDto,
} from '@social/shared';

import { baseApi, subscribeToSocket } from '@/shared';

function toLastMessage(message: MessageDto): LastMessageDto {
  return {
    id: message.id,
    senderId: message.senderId,
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt,
    updatedAt: message.createdAt,
  };
}

function sortConversations(conversations: ConversationDto[]): ConversationDto[] {
  return [...conversations].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function applyConversationEvent(
  conversations: ConversationDto[],
  event: ConversationUpdatedEvent,
): void {
  const index = conversations.findIndex(({ id }) => id === event.conversationId);
  const current = conversations[index];

  if (!current) {
    return;
  }

  conversations[index] = {
    ...current,
    lastMessage: event.lastMessage,
    updatedAt: event.updatedAt,
  };

  sortConversations(conversations).forEach((conversation, sortedIndex) => {
    conversations[sortedIndex] = conversation;
  });
}

function applyConversationCleared(conversations: ConversationDto[], conversationId: string): void {
  const index = conversations.findIndex(({ id }) => id === conversationId);
  const current = conversations[index];

  if (!current) {
    return;
  }

  conversations[index] = { ...current, lastMessage: null };
}

export const conversationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<ConversationDto[], void>({
      query: () => '/conversations',
      providesTags: ['Conversations'],
      async onCacheEntryAdded(
        _arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const unsubscribeUpdated = subscribeToSocket('conversation:updated', (event) => {
          dispatch(
            conversationApi.util.updateQueryData('getConversations', undefined, (draft) => {
              applyConversationEvent(draft, event);
            }),
          );
        });

        const unsubscribeMessage = subscribeToSocket('message:new', (message) => {
          const event: ConversationUpdatedEvent = {
            conversationId: message.conversationId,
            lastMessage: toLastMessage(message),
            updatedAt: message.createdAt,
          };

          dispatch(
            conversationApi.util.updateQueryData('getConversations', undefined, (draft) => {
              applyConversationEvent(draft, event);
            }),
          );
        });

        const unsubscribeCleared = subscribeToSocket('conversation:cleared', (event) => {
          dispatch(
            conversationApi.util.updateQueryData('getConversations', undefined, (draft) => {
              applyConversationCleared(draft, event.conversationId);
            }),
          );
        });

        try {
          await cacheDataLoaded;
          await cacheEntryRemoved;
        } finally {
          unsubscribeUpdated();
          unsubscribeMessage();
          unsubscribeCleared();
        }
      },
    }),
    createConversation: build.mutation<ConversationDto, CreateConversationInput>({
      query: (body) => ({
        url: '/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

export const { useGetConversationsQuery, useCreateConversationMutation } = conversationApi;
