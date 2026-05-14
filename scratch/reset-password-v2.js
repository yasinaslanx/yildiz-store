const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetPassword() {
  try {
    const email = 'aslanyasin320@gmail.com';
    const newPassword = '123456';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('--- ŞİFRE GÜNCELLEME ---');
    console.log('Kullanıcı:', email);
    console.log('Yeni Şifre: 123456 (Sistem kuralı gereği en az 6 karakter)');
    console.log('-----------------------');
  } catch (error) {
    console.error('HATA:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetPassword();
