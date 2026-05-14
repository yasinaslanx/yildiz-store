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
    const newPassword = '1234';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('--- ŞİFRE SIFIRLAMA ---');
    console.log('Kullanıcı:', updatedUser.email);
    console.log('Durum: Şifre başarıyla "1234" olarak güncellendi.');
    console.log('-----------------------');
  } catch (error) {
    console.error('HATA:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetPassword();
