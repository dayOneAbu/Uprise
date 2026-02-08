import "dotenv/config";
import { PrismaClient } from "./generated/prisma/index.js";
import { hashPassword } from "better-auth/crypto";

const DEMO_EMAIL = "candidate@uprise.demo";
const DEFAULT_PASSWORD = "123456789";
const PROVIDER_ID = "credential";

async function main() {
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    console.error(`User not found: ${DEMO_EMAIL}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: PROVIDER_ID,
    },
  });

  if (existing) {
    console.log("Credential account already exists:", existing.id);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
  const created = await prisma.account.create({
    data: {
      id: `account_${user.id}`,
      accountId: DEMO_EMAIL,
      providerId: PROVIDER_ID,
      userId: user.id,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Created credential account:", created.id);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
