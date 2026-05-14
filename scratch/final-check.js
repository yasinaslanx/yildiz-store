const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'aslanyasin320@gmail.com' }
    });
    
    console.log('--- SİSTEM KONTROLÜ ---');
    if (user) {
      console.log('DURUM: Kullanıcı veritabanında mevcut.');
      console.log('Kullanıcı ID:', user.id);
      console.log('Email:', user.email);
      console.log('Rol:', user.role);
    } else {
      console.log('DURUM: Kullanıcı BULUNAMADI.');
      console.log('Tavsiye: Lütfen önce kayıt olun (Register).');
    }
    console.log('-----------------------');
  } catch (error) {
    console.error('HATA:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUser();
