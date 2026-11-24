import type { Request } from 'express';

import { ApiError } from './api-error';

const AUTH_REQUIRED_MESSAGE = 'Требуется авторизация';

export function getAuthenticatedUserId(request: Request): string {
  const userId = request.user?.userId;

  if (!userId) {
    throw new ApiError(401, AUTH_REQUIRED_MESSAGE);
  }

  return userId;
}
