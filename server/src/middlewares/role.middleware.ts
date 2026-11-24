import type { UserRole } from '@social/shared';
import type { RequestHandler } from 'express';

import { UserModel } from '../models';
import { ApiError } from '../utils';

const FORBIDDEN_MESSAGE = 'Недостаточно прав для выполнения действия';
const AUTH_REQUIRED_MESSAGE = 'Требуется авторизация';

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return async (request, response, next) => {
    void response;

    try {
      const userId = request.user?.userId;

      if (!userId) {
        next(new ApiError(401, AUTH_REQUIRED_MESSAGE));
        return;
      }

      const user = await UserModel.findById(userId).select('role');
      const role: UserRole = user?.role || 'user';

      if (!allowedRoles.includes(role)) {
        next(new ApiError(403, FORBIDDEN_MESSAGE));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
