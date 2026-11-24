import type { RequestHandler } from 'express';

import { verifyAccessToken } from '../utils';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
    };
  }
}

export const authMiddleware: RequestHandler = (request, response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Токен доступа отсутствует' });
    return;
  }

  const accessToken = authorizationHeader.slice('Bearer '.length).trim();

  if (!accessToken) {
    response.status(401).json({ message: 'Токен доступа отсутствует' });
    return;
  }

  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    response.status(401).json({ message: 'Недействительный или просроченный токен доступа' });
    return;
  }

  request.user = { userId: payload.userId };
  next();
};
