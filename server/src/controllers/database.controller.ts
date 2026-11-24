import type { RequestHandler } from 'express';

import { clearDatabase } from '../services';

export const clearDatabaseController: RequestHandler = async (request, response, next) => {
  void request;

  try {
    const result = await clearDatabase();

    response.status(200).json({
      message: 'База данных очищена',
      collections: result.collections,
      documents: result.documents,
    });
  } catch (error) {
    next(error);
  }
};
