import { loginSchema, registerSchema, resendCodeSchema, verifyEmailSchema } from '@social/shared';
import { Router } from 'express';

import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
  resendCodeController,
  verifyEmailController,
} from '../controllers';
import { authMiddleware, validateBody } from '../middlewares';

export const authRoutes = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Начать регистрацию и отправить код подтверждения
 *     description: Создаёт неподтверждённого пользователя или обновляет существующего неподтверждённого, затем отправляет на почту 6-значный код, действующий 10 минут. Токены выдаются только после POST /api/auth/verify-email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       '201':
 *         description: Новый неподтверждённый пользователь создан, код подтверждения отправлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       '200':
 *         description: Существующий неподтверждённый пользователь обновлён, отправлен новый код
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       '400':
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Почта принадлежит подтверждённому пользователю или имя занято
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '502':
 *         description: Не удалось отправить письмо подтверждения
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/register', validateBody(registerSchema), registerController);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Войти по электронной почте и паролю
 *     description: Проверяет учётные данные и сохраняет токен обновления в httpOnly-cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Вход выполнен, возвращён токен доступа и установлена cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Неверная электронная почта или пароль
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Электронная почта не подтверждена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/login', validateBody(loginSchema), loginController);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Подтвердить почту 6-значным кодом
 *     description: Подтверждает пользователя, очищает код и выдаёт пару токенов с refresh-токеном в httpOnly-cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       '200':
 *         description: Почта подтверждена, возвращён токен доступа и установлена cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Ошибка валидации, код неверен, просрочен или почта уже подтверждена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/verify-email', validateBody(verifyEmailSchema), verifyEmailController);

/**
 * @openapi
 * /api/auth/resend-code:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Отправить новый код подтверждения
 *     description: Генерирует и отправляет неподтверждённому пользователю новый 6-значный код, действующий 10 минут.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendCodeRequest'
 *     responses:
 *       '200':
 *         description: Новый код отправлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       '400':
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Неподтверждённый пользователь с такой почтой не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/resend-code', validateBody(resendCodeSchema), resendCodeController);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Обновить токен доступа
 *     description: Читает токен обновления из httpOnly-cookie и выдаёт новую пару токенов.
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         description: Токен обновления, установленный при регистрации, входе или обновлении
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Возвращён новый токен доступа и обновлена cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '401':
 *         description: Токен обновления отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post('/refresh', refreshController);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Авторизация
 *     summary: Выйти из аккаунта
 *     description: Очищает httpOnly-cookie с токеном обновления.
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: false
 *         description: Токен обновления, который нужно очистить
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Cookie с токеном обновления очищена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Вы вышли из аккаунта
 */
authRoutes.post('/logout', logoutController);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Авторизация
 *     summary: Получить текущего пользователя
 *     description: Возвращает публичный профиль авторизованного пользователя.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Профиль текущего пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDto'
 *       '401':
 *         description: Токен доступа отсутствует, недействителен или просрочен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.get('/me', authMiddleware, meController);
