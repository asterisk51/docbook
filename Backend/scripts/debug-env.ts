
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.DATABASE_URL || 'NOT_SET';
console.log('--- ENV START ---');
console.log(JSON.stringify({ DATABASE_URL: url }, null, 2));
console.log('--- ENV END ---');
