import "dotenv/config";
import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaNeon } from "@prisma/adapter-neon";

async function checkUser(email: string) {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error("DIRECT_URL is missing in env");
  }

  const adapter = new PrismaNeon({ connectionString: directUrl });
  const prisma = new PrismaClient({ adapter });

  const exact = await prisma.user.findUnique({ where: { email } });
  const lower = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  const like = await prisma.user.findMany({
    where: { email: { contains: email.split("@")[0], mode: "insensitive" } },
    select: { id: true, email: true },
    take: 10,
  });

  await prisma.$disconnect();

  return { exact, lower, like };
}

async function main() {
  const target = "candidate@UPrise.demo";
  console.log("Using DIRECT_URL host:", process.env.DIRECT_URL?.split("@")[1]);
  console.log(`Checking user: ${target}`);

  const result = await checkUser(target);
  console.log("Exact:", result.exact ? "FOUND" : "NOT FOUND");
  console.log("Lowercase:", result.lower ? "FOUND" : "NOT FOUND");
  console.log("LIKE:", result.like.map((u) => `"${u.email}"`).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
