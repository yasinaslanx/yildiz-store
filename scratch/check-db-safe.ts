import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const orderCount = await prisma.order.count();
  const userCount = await prisma.user.count();
  const orders = await prisma.order.findMany({ include: { items: true } });
  
  console.log({
    orderCount,
    userCount,
    orders: orders.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status }))
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
