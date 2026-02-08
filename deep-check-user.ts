import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';
import { PrismaNeon } from '@prisma/adapter-neon';

async function deepCheck() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Using URL:', connectionString?.split('@')[1]); // Log host only

    const adapter = new PrismaNeon({ connectionString });
    const prisma = new PrismaClient({ adapter });

    const target = 'candidate@UPrise.demo';
    console.log(`\n--- Checking for exact match: "${target}" ---`);
    const exact = await prisma.user.findUnique({ where: { email: target } });
    console.log('Result:', exact ? 'FOUND' : 'NOT FOUND');

    console.log('\n--- Checking for lowercase match: "candidate@uprise.demo" ---');
    const lower = await prisma.user.findUnique({ where: { email: target.toLowerCase() } });
    console.log('Result:', lower ? 'FOUND' : 'NOT FOUND');

    console.log('\n--- Searching with LIKE ---');
    const liked = await prisma.user.findMany({
        where: { email: { contains: 'candidate', mode: 'insensitive' } }
    });
    console.log('Found with LIKE:', liked.map(u => `"${u.email}"`));

    console.log('\n--- All Users (First 5) ---');
    const all = await prisma.user.findMany({ take: 5 });
    all.forEach(u => console.log(` - "${u.email}" (ID: ${u.id})`));

    await prisma.$disconnect();
}

deepCheck();
