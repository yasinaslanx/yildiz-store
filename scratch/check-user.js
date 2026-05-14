const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'aslanyasin320@gmail.com' }
    });
    console.log('--- SONUÇ ---');
    if (user) {
      console.log('Kullanıcı MEVCUT.');
      console.log('Email:', user.email);
      console.log('Rol:', user.role);
    } else {
      console.log('Kullanıcı BULUNAMADI.');
    }
    console.log('--------------');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
