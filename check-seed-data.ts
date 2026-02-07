
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    const challengeCount = await prisma.challenge.count();
    const taskCount = await prisma.task.count();
    const skillScoreCount = await prisma.skillScore.count();

    console.log(`Challenges: ${challengeCount}`);
    console.log(`Tasks: ${taskCount}`);
    console.log(`Skill Scores: ${skillScoreCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
