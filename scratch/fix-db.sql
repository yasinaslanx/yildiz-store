ALTER TABLE "PasswordResetToken" ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3);
ALTER TABLE "PasswordResetToken" ADD COLUMN IF NOT EXISTS "tokenHash" TEXT;
ALTER TABLE "PasswordResetToken" DROP COLUMN IF EXISTS "used";
ALTER TABLE "PasswordResetToken" DROP COLUMN IF EXISTS "token";
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
