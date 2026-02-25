-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredLanguage" "Locale";
ALTER TABLE "User" ADD COLUMN "activeStudentProfileId" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "formData" JSONB;

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "PaymentTransaction" ADD COLUMN "externalTxnId" TEXT;

-- CreateIndex
CREATE INDEX "PaymentTransaction_idempotencyKey_idx" ON "PaymentTransaction"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeStudentProfileId_fkey" FOREIGN KEY ("activeStudentProfileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
