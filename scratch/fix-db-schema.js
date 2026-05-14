const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Veritabanı tablosu güncelleniyor...');
    
    // usedAt kolonunu ekle (yoksa)
    await pool.query('ALTER TABLE "PasswordResetToken" ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3)');
    
    // tokenHash kolonunu ekle (yoksa)
    await pool.query('ALTER TABLE "PasswordResetToken" ADD COLUMN IF NOT EXISTS "tokenHash" TEXT');
    
    // Eski kolonları temizle (isteğe bağlı ama karışıklığı önler)
    try { await pool.query('ALTER TABLE "PasswordResetToken" DROP COLUMN IF EXISTS "used"'); } catch(e) {}
    try { await pool.query('ALTER TABLE "PasswordResetToken" DROP COLUMN IF EXISTS "token"'); } catch(e) {}

    // Benzersiz kısıtlamayı ekle
    try { await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash")'); } catch(e) {}

    console.log('Veritabanı tablosu başarıyla güncellendi.');
  } catch (err) {
    console.error('Hata oluştu:', err);
  } finally {
    await pool.end();
  }
}

main();
