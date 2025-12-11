
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the parent directory (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
    console.log('Script started.');
    console.log(`DATABASE_URL is set: ${!!process.env.DATABASE_URL}`);

    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
        console.log(`Using connection string from env: ${connectionString.substring(0, 20)}...`);
    } else {
        console.error("DATABASE_URL is missing!");
        return;
    }

    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

    console.log('Attempting to connect to database...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database!');
    } catch (error: any) {
        console.error('Failed to connect to database.');
        console.error('Error Name:', error.name);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
