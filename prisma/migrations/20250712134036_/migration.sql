-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ORGANIZATION', 'RESTAURANT', 'INDIVIDUAL_DONOR') NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `primary_PhoneN` VARCHAR(191) NOT NULL,
    `secondary_PhoneN` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `userId` INTEGER NOT NULL,
    `orgName` VARCHAR(191) NOT NULL,
    `regNumber` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Organization_userId_key`(`userId`),
    UNIQUE INDEX `Organization_regNumber_key`(`regNumber`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IndividualDonor` (
    `userId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `idcard` VARCHAR(191) NULL,

    UNIQUE INDEX `IndividualDonor_userId_key`(`userId`),
    UNIQUE INDEX `IndividualDonor_idcard_key`(`idcard`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `userId` INTEGER NOT NULL,
    `ResName` VARCHAR(191) NOT NULL,
    `openTime` VARCHAR(191) NOT NULL,
    `closeTime` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `foodId` INTEGER NULL,

    UNIQUE INDEX `Restaurant_userId_key`(`userId`),
    UNIQUE INDEX `Restaurant_foodId_key`(`foodId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Food` (
    `foodId` INTEGER NOT NULL AUTO_INCREMENT,
    `claimId` INTEGER NOT NULL,
    `DonatedByRes` INTEGER NOT NULL,
    `DonatedByInd` INTEGER NOT NULL,
    `resName` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `deadline` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Food_foodId_key`(`foodId`),
    UNIQUE INDEX `Food_claimId_key`(`claimId`),
    UNIQUE INDEX `Food_title_key`(`title`),
    PRIMARY KEY (`foodId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodClaim` (
    `claimId` INTEGER NOT NULL AUTO_INCREMENT,
    `claimedAt` DATETIME(3) NOT NULL,
    `foodId` INTEGER NOT NULL,
    `claimedBy` INTEGER NOT NULL,
    `deliver` BOOLEAN NOT NULL,
    `specialInstruction` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETE') NOT NULL,

    UNIQUE INDEX `FoodClaim_foodId_key`(`foodId`),
    UNIQUE INDEX `FoodClaim_claimedBy_key`(`claimedBy`),
    PRIMARY KEY (`claimId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `action` ENUM('CREATE_FOOD', 'UPDATE_FOOD', 'DELETE_FOOD', 'CLAIM_FOOD', 'CANCEL_CLAIM') NOT NULL,
    `targetId` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IndividualDonor` ADD CONSTRAINT `IndividualDonor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Food` ADD CONSTRAINT `Food_DonatedByInd_fkey` FOREIGN KEY (`DonatedByInd`) REFERENCES `IndividualDonor`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Food` ADD CONSTRAINT `Food_DonatedByRes_fkey` FOREIGN KEY (`DonatedByRes`) REFERENCES `Restaurant`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodClaim` ADD CONSTRAINT `FoodClaim_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`foodId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodClaim` ADD CONSTRAINT `FoodClaim_claimedBy_fkey` FOREIGN KEY (`claimedBy`) REFERENCES `Organization`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
