-- AlterTable
ALTER TABLE "Event" ADD COLUMN "address" TEXT;
ALTER TABLE "Event" ADD COLUMN "mapUrl" TEXT;

-- AlterTable
ALTER TABLE "EventTranslation" ADD COLUMN "prizes" TEXT;
ALTER TABLE "EventTranslation" ADD COLUMN "levelInfo" TEXT;
