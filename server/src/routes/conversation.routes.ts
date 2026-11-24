import { createConversationSchema } from '@social/shared';
import { Router } from 'express';

import {
  clearConversationMessagesController,
  createConversationController,
  getConversationMessagesController,
  getConversationsController,
} from '../controllers';
import { authMiddleware, validateBody } from '../middlewares';

export const conversationRoutes = Router();

/**
 * @openapi
 * /api/conversations:
 *   get:
 *     tags:
 *       - Сообщения
 *     summary: Получить все диалоги текущего пользователя
 *     description: Возвращает диалоги, в которых участвует авторизованный пользователь. Участники и последнее сообщение заполнены данными, диалоги отсортированы по дате обновления.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Список диалогов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversationDto'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
conversationRoutes.get('/', authMiddleware, getConversationsController);

/**
 * @openapi
 * /api/conversations/{id}/messages:
 *   get:
 *     tags:
 *       - Сообщения
 *     summary: Получить историю переписки диалога
 *     description: Проверяет участие пользователя в диалоге, помечает его входящие сообщения прочитанными и возвращает сообщения в порядке увеличения времени отправки.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор диалога
 *     responses:
 *       '200':
 *         description: История переписки
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessageDto'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Диалог не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
conversationRoutes.get('/:id/messages', authMiddleware, getConversationMessagesController);

/**
 * @openapi
 * /api/conversations/{id}/messages:
 *   delete:
 *     tags:
 *       - Сообщения
 *     summary: Очистить историю переписки диалога
 *     description: Проверяет участие пользователя в диалоге, удаляет все его сообщения, сбрасывает последнее сообщение диалога и отправляет участникам socket-события conversation:cleared и conversation:updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Идентификатор диалога
 *     responses:
 *       '200':
 *         description: Диалог очищен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Диалог не найден либо пользователь не является его участником
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
conversationRoutes.delete('/:id/messages', authMiddleware, clearConversationMessagesController);

/**
 * @openapi
 * /api/conversations:
 *   post:
 *     tags:
 *       - Сообщения
 *     summary: Создать или получить личный диалог
 *     description: Находит существующий диалог между текущим пользователем и участником либо создаёт новый.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       '201':
 *         description: Диалог создан или найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDto'
 *       '400':
 *         description: Ошибка валидации или попытка создать диалог с собой
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Участник не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
conversationRoutes.post(
  '/',
  authMiddleware,
  validateBody(createConversationSchema),
  createConversationController,
);
