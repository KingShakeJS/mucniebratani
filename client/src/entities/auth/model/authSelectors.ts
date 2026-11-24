import type { AuthState } from './authSlice';

type StateWithAuth = {
  auth: AuthState;
};

export const selectAccessToken = (state: StateWithAuth): string | null => state.auth.accessToken;

export const selectIsAuthenticated = (state: StateWithAuth): boolean =>
  Boolean(state.auth.accessToken);
