const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const updates = [
    { slug: 'phone-accessories', image: 'https://images.unsplash.com/photo-1546435770-a3e426ca472b?q=80&w=1000' },
    { slug: 'computers', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000' },
    { slug: 'bilgisayarlar', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000' },
    { slug: 'phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000' },
    { slug: 'telefonlar', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000' },
  ];

  for (const update of updates) {
    try {
      const res = await pool.query(
        'UPDATE "Category" SET image = $1 WHERE slug = $2',
        [update.image, update.slug]
      );
      console.log(`Updated ${update.slug}: ${res.rowCount} record(s)`);
    } catch (err) {
      console.error(`Error updating ${update.slug}:`, err.message);
    }
  }
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    pool.end();
    process.exit(1);
  });
