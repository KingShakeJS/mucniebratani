import type { RequestHandler } from 'express';

export const healthController: RequestHandler = (request, response) => {
  void request;
  response.status(200).json({ status: 'ok' });
};
