import { config as loadEnv } from 'dotenv';

loadEnv();

const {
  NODE_ENV,
  PORT,
  MONGO_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  CLIENT_URL,
  SUPERADMIN_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const smtpPort = Number(SMTP_PORT ?? 465);

export const env = {
  nodeEnv: NODE_ENV ?? 'development',
  port: Number(PORT ?? 5001),
  mongoUri: MONGO_URI ?? 'mongodb://127.0.0.1:27017/social_network',
  jwtAccessSecret: JWT_ACCESS_SECRET ?? '',
  jwtRefreshSecret: JWT_REFRESH_SECRET ?? '',
  clientUrl: CLIENT_URL ?? 'http://localhost:3000',
  superadminEmail: SUPERADMIN_EMAIL ?? 'boris.lyudochka@yandex.ru',
  smtp: {
    host: SMTP_HOST ?? 'smtp.yandex.ru',
    port: smtpPort,
    secure: SMTP_SECURE === undefined ? smtpPort === 465 : SMTP_SECURE === 'true',
    user: SMTP_USER ?? '',
    pass: SMTP_PASS ?? '',
    from: SMTP_FROM ?? 'Социальная сеть <noreply@example.com>',
  },
};
