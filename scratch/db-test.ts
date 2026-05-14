import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('Connected successfully!');

    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();

    console.log({
      userCount,
      productCount,
      categoryCount
    });

    if (productCount === 0) {
      console.warn('WARNING: No products found in database.');
    }
    if (userCount === 0) {
      console.warn('WARNING: No users found in database.');
    }

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
