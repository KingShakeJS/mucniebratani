import type { RequestHandler } from 'express';

import { getPublicUser, getUsers } from '../services';
import { ApiError } from '../utils';

export const getUsersController: RequestHandler = async (request, response, next) => {
  const rawSearch = request.query.search;
  const search = typeof rawSearch === 'string' ? rawSearch.trim() : undefined;

  try {
    const users = await getUsers(search);

    response.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserController: RequestHandler = async (request, response, next) => {
  const { id } = request.params;

  if (typeof id !== 'string') {
    next(new ApiError(404, 'Пользователь не найден'));
    return;
  }

  try {
    const user = await getPublicUser(id);

    response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
