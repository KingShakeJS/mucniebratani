import { Router } from 'express';

import { healthController, rootController } from '../controllers';
import { authRoutes } from './auth.routes';
import { databaseRoutes } from './database.routes';

export { conversationRoutes } from './conversation.routes';
export { messageRoutes } from './message.routes';
export { usersRoutes } from './users.routes';

export const routes = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Работоспособность
 *     summary: Проверить работоспособность сервиса
 *     responses:
 *       '200':
 *         description: Сервис работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
routes.get('/', rootController);
routes.get('/health', healthController);
routes.use('/auth', authRoutes);
routes.use('/database', databaseRoutes);
