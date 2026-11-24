import type {
  ClearConversationMessagesResponse,
  MessageDto,
  SendConversationMessageInput,
  SendDirectMessageInput,
} from '@social/shared';

import { baseApi, subscribeToSocket } from '@/shared';

export const messageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversationMessages: build.query<MessageDto[], string>({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      providesTags: (_result, _error, conversationId) => [{ type: 'Messages', id: conversationId }],
      async onCacheEntryAdded(conversationId, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
        const unsubscribeMessage = subscribeToSocket('message:new', (message) => {
          if (message.conversationId !== conversationId) {
            return;
          }

          dispatch(
            messageApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
              if (draft.some(({ id }) => id === message.id)) {
                return;
              }

              draft.push(message);
              draft.sort(
                (left, right) =>
                  new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
              );
            }),
          );
        });

        const unsubscribeCleared = subscribeToSocket('conversation:cleared', (event) => {
          if (event.conversationId !== conversationId) {
            return;
          }

          dispatch(
            messageApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
              draft.splice(0, draft.length);
            }),
          );
        });

        try {
          await cacheDataLoaded;
          await cacheEntryRemoved;
        } finally {
          unsubscribeMessage();
          unsubscribeCleared();
        }
      },
    }),
    sendDirectMessage: build.mutation<MessageDto, SendDirectMessageInput>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),
    sendConversationMessage: build.mutation<MessageDto, SendConversationMessageInput>({
      query: (body) => ({
        url: '/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, body) => [
        { type: 'Messages', id: body.conversationId },
        'Conversations',
      ],
    }),
    clearConversationMessages: build.mutation<ClearConversationMessagesResponse, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/messages`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          messageApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
            draft.splice(0, draft.length);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useClearConversationMessagesMutation,
  useGetConversationMessagesQuery,
  useSendDirectMessageMutation,
  useSendConversationMessageMutation,
} = messageApi;
