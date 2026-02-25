-- Add Telegram auth fields to User
ALTER TABLE "User"
ADD COLUMN "telegramId" TEXT,
ADD COLUMN "telegramUsername" TEXT,
ADD COLUMN "telegramFirstName" TEXT,
ADD COLUMN "telegramLastName" TEXT,
ADD COLUMN "telegramPhotoUrl" TEXT,
ADD COLUMN "telegramAuthAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
