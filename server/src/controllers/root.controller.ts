import type { RequestHandler } from 'express';

/**
 * @openapi
 * /:
 *   get:
 *     tags:
 *       - Корень
 *     summary: Приветствие на корневом маршруте
 *     responses:
 *       '200':
 *         description: Приветственное сообщение
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Привет из API социальной сети
 * /api:
 *   get:
 *     tags:
 *       - Корень
 *     summary: Приветствие на корневом маршруте API
 *     responses:
 *       '200':
 *         description: Приветственное сообщение
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Привет из API социальной сети
 */
export const rootController: RequestHandler = (request, response) => {
  void request;
  response.status(200).json({ message: 'Привет из API социальной сети' });
};
