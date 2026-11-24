import { sendMessageSchema } from '@social/shared';
import { Router } from 'express';

import { sendMessageController } from '../controllers';
import { authMiddleware, validateBody } from '../middlewares';

export const messageRoutes = Router();

/**
 * @openapi
 * /api/messages:
 *   post:
 *     tags:
 *       - Сообщения
 *     summary: Отправить сообщение в личный диалог
 *     description: При указании recipientId находит или создаёт диалог, при указании conversationId отправляет сообщение в существующий диалог. Сообщение сохраняется, обновляется последнее сообщение диалога, участникам отправляются socket-события message:new и conversation:updated.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       '201':
 *         description: Сообщение отправлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDto'
 *       '400':
 *         description: Ошибка валидации или попытка отправить сообщение себе
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
 *         description: Диалог или получатель не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
messageRoutes.post('/', authMiddleware, validateBody(sendMessageSchema), sendMessageController);
