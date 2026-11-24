import { connect, disconnect } from 'mongoose';

import { env } from '../config/env';
import { UserModel } from '../models';

function resolveEmail(): string {
  const email = process.argv[2]?.trim() || env.superadminEmail;

  if (!email) {
    throw new Error('Не указан email суперадмина');
  }

  return email.toLowerCase();
}

async function seedAdmin(): Promise<void> {
  const email = resolveEmail();

  await connect(env.mongoUri);

  try {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { $set: { role: 'superadmin' } },
      { new: true },
    );

    if (!user) {
      console.log(`Пользователь с email ${email} не найден.`);
      return;
    }

    console.log(`Пользователю ${user.username} (${user.email}) назначена роль «Суперадмин».`);
  } finally {
    await disconnect();
  }
}

seedAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Не удалось назначить роль суперадмина: ${message}`);
  process.exitCode = 1;
});
