import { Router } from 'express';

import { clearDatabaseController } from '../controllers';

export const databaseRoutes = Router();

/**
 * @openapi
 * /api/database/clear:
 *   delete:
 *     tags:
 *       - База данных
 *     summary: Очистить базу данных
 *     description: Удаляет все документы из коллекций пользователей, постов, комментариев, диалогов, сообщений и уведомлений. Структура базы данных сохраняется.
 *     responses:
 *       '200':
 *         description: База данных очищена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - collections
 *                 - documents
 *               properties:
 *                 message:
 *                   type: string
 *                   example: База данных очищена
 *                 collections:
 *                   type: integer
 *                   example: 6
 *                 documents:
 *                   type: integer
 *                   example: 42
 *       '500':
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
databaseRoutes.delete('/clear', clearDatabaseController);
