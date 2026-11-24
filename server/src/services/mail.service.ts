import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../config';
import { ApiError } from '../utils';

const VERIFICATION_CODE_TTL_MINUTES = 10;
const MAIL_SEND_ERROR_MESSAGE = 'Не удалось отправить письмо. Попробуйте позже.';

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Ваш код подтверждения: ${code}. Код действителен ${VERIFICATION_CODE_TTL_MINUTES} минут.`,
      html: `
        <div style="margin:0; padding:32px 16px; background:#f5f7fa; font-family:Arial, Helvetica, sans-serif; color:#1f2933;">
          <div style="max-width:480px; margin:0 auto; padding:32px; background:#ffffff; border-radius:12px;">
            <h1 style="margin:0 0 16px; font-size:22px;">Подтверждение email</h1>
            <p style="margin:0 0 24px; font-size:15px; line-height:1.5;">
              Чтобы завершить регистрацию, введите код подтверждения:
            </p>
            <div style="margin:0 0 24px; padding:16px; background:#eef4ff; border-radius:8px; text-align:center; font-size:28px; font-weight:bold; letter-spacing:6px; color:#1976d2;">
              ${code}
            </div>
            <p style="margin:0; font-size:13px; line-height:1.5; color:#667085;">
              Код действителен ${VERIFICATION_CODE_TTL_MINUTES} минут. Если вы не регистрировались, просто проигнорируйте это письмо.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const smtpCode =
      typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : 'не указан';

    console.error(
      `Не удалось отправить письмо подтверждения на ${email} через SMTP ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Причина: ${reason}. Код SMTP: ${smtpCode}.`,
    );

    throw new ApiError(502, MAIL_SEND_ERROR_MESSAGE);
  }
}
