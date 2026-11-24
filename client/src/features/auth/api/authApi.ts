import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  RegisterResponse,
  ResendCodeInput,
  UserDto,
  VerifyEmailInput,
} from '@social/shared';

import { clearAuthSession, markAuthSession } from '@/entities/auth';
import { baseApi } from '@/shared';

import { isUnauthorizedError } from '../lib/isUnauthorizedError';

type MessageResponse = {
  message: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<RegisterResponse, RegisterInput>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getMe: build.query<UserDto, void>({
      query: () => '/auth/me',
    }),
    login: build.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
          markAuthSession();
        } catch {
          clearAuthSession();
        }
      },
    }),
    verifyEmail: build.mutation<AuthResponse, VerifyEmailInput>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
          markAuthSession();
        } catch {
          clearAuthSession();
        }
      },
    }),
    resendCode: build.mutation<MessageResponse, ResendCodeInput>({
      query: (body) => ({
        url: '/auth/resend-code',
        method: 'POST',
        body,
      }),
    }),
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          if (isUnauthorizedError(error)) {
            clearAuthSession();
          }
        }
      },
    }),
    logout: build.mutation<MessageResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          dispatch(baseApi.util.resetApiState());
          clearAuthSession();
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useGetMeQuery,
  useLoginMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;
