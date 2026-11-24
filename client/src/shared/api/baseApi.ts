import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type StateWithAuth = {
  auth: {
    accessToken: string | null;
  };
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const { auth } = getState() as StateWithAuth;

      if (auth.accessToken) {
        headers.set('Authorization', `Bearer ${auth.accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Conversations', 'Messages'],
  endpoints: () => ({}),
});
