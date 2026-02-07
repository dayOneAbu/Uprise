
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const jobCount = await prisma.job.count();
    console.log(`Users: ${userCount}`);
    console.log(`Jobs: ${jobCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
