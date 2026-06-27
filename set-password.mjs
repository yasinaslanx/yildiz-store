import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'aslanyasin320@gmail.com';
  const password = '12345678';
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log('Password updated for', email);
  } catch (err) {
    console.log('User not found or error:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
