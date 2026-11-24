import { Router } from 'express';

import { getUserController, getUsersController } from '../controllers';
import { authMiddleware } from '../middlewares';

export const usersRoutes = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Пользователи
 *     summary: Получить список подтверждённых пользователей
 *     description: Возвращает пользователей, отсортированных по дате регистрации. При наличии параметра search выполняет поиск по имени без учёта регистра.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         description: Строка поиска по имени пользователя
 *         schema:
 *           type: string
 *           example: King
 *     responses:
 *       '200':
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserDto'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
usersRoutes.get('/', authMiddleware, getUsersController);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Пользователи
 *     summary: Получить публичный профиль пользователя
 *     description: Возвращает публичные данные пользователя по его идентификатору. Электронная почта не возвращается.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Идентификатор пользователя
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Публичный профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUserDto'
 *       '404':
 *         description: Пользователь не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
usersRoutes.get('/:id', getUserController);
