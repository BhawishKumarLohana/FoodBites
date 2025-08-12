/*
  Warnings:

  - You are about to drop the column `targetId` on the `activitylog` table. All the data in the column will be lost.
  - You are about to drop the column `DonatedByInd` on the `food` table. All the data in the column will be lost.
  - You are about to drop the column `DonatedByRes` on the `food` table. All the data in the column will be lost.
  - You are about to drop the column `resName` on the `food` table. All the data in the column will be lost.
  - Added the required column `DonatedBy` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `food` DROP FOREIGN KEY `Food_DonatedByInd_fkey`;

-- DropForeignKey
ALTER TABLE `food` DROP FOREIGN KEY `Food_DonatedByRes_fkey`;

-- DropForeignKey
ALTER TABLE `foodclaim` DROP FOREIGN KEY `FoodClaim_claimedBy_fkey`;

-- DropForeignKey
ALTER TABLE `foodclaim` DROP FOREIGN KEY `FoodClaim_foodId_fkey`;

-- DropIndex
DROP INDEX `Food_DonatedByInd_fkey` ON `food`;

-- DropIndex
DROP INDEX `Food_DonatedByRes_fkey` ON `food`;

-- DropIndex
DROP INDEX `Food_title_key` ON `food`;

-- DropIndex
DROP INDEX `FoodClaim_claimedBy_key` ON `foodclaim`;

-- DropIndex
DROP INDEX `FoodClaim_foodId_key` ON `foodclaim`;

-- AlterTable
ALTER TABLE `activitylog` DROP COLUMN `targetId`;

-- AlterTable
ALTER TABLE `food` DROP COLUMN `DonatedByInd`,
    DROP COLUMN `DonatedByRes`,
    DROP COLUMN `resName`,
    ADD COLUMN `DonatedBy` INTEGER NOT NULL,
    ADD COLUMN `isDelivery` BOOLEAN NULL DEFAULT false,
    MODIFY `claimId` INTEGER NULL,
    MODIFY `quantity` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `addressVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `averageRating` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `phoneVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `totalRatings` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trustLevel` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL DEFAULT 'BRONZE',
    ADD COLUMN `trustScore` DOUBLE NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE `Rating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `raterId` INTEGER NOT NULL,
    `ratedUserId` INTEGER NOT NULL,
    `claimId` INTEGER NULL,

    UNIQUE INDEX `Rating_raterId_ratedUserId_claimId_key`(`raterId`, `ratedUserId`, `claimId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Food` ADD CONSTRAINT `Food_DonatedBy_fkey` FOREIGN KEY (`DonatedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodClaim` ADD CONSTRAINT `FoodClaim_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`foodId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodClaim` ADD CONSTRAINT `FoodClaim_claimedBy_fkey` FOREIGN KEY (`claimedBy`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_raterId_fkey` FOREIGN KEY (`raterId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_ratedUserId_fkey` FOREIGN KEY (`ratedUserId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
