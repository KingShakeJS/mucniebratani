import type { PublicUserDto, UserDto } from '@social/shared';

import { baseApi } from '@/shared';

type SearchUsersParams = {
  search: string;
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchUsers: build.query<UserDto[], SearchUsersParams>({
      query: ({ search }) => ({
        url: '/users',
        params: search ? { search } : {},
      }),
    }),
    getUserById: build.query<PublicUserDto, string>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const { useGetUserByIdQuery, useSearchUsersQuery } = userApi;
