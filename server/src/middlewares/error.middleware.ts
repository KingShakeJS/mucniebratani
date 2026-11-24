import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { ApiError } from '../utils';

function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 11000;
}

function isBodyParseError(error: unknown): boolean {
  return error instanceof SyntaxError && 'status' in error && error.status === 400;
}

function getValidationIssues(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  void request;
  void next;

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Ошибка валидации', errors: getValidationIssues(error) });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ message: 'Ошибка валидации данных' });
    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(409).json({ message: 'Электронная почта или имя пользователя уже используются' });
    return;
  }

  if (isBodyParseError(error)) {
    response.status(400).json({ message: 'Некорректный JSON в теле запроса' });
    return;
  }

  console.error('Unhandled error:', error);
  response.status(500).json({ message: 'Внутренняя ошибка сервера' });
};
