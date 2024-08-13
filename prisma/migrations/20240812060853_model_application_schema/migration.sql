/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "imageUrl",
ADD COLUMN     "imagePath" TEXT;
