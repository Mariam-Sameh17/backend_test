-- CreateTable
CREATE TABLE `Coupons` (
    `couponId` INTEGER NOT NULL AUTO_INCREMENT,
    `restaurantID` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `available_uses` INTEGER NOT NULL,

    PRIMARY KEY (`couponId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customerAddress` (
    `location` VARCHAR(100) NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`location`, `customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customerSubscription` (
    `status` VARCHAR(20) NULL,
    `startDate` DATETIME(3) NULL,
    `subscriptionId` VARCHAR(50) NOT NULL,
    `restaurantID` INTEGER NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,
    `paymentId` INTEGER NULL,

    PRIMARY KEY (`customerId`, `subscriptionId`, `restaurantID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveryChat` (
    `messageId` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(100) NOT NULL,
    `timeSent` DATETIME(3) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `SRFlag` CHAR(1) NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveryPerson` (
    `userName` VARCHAR(50) NOT NULL,
    `bankId` VARCHAR(20) NOT NULL,
    `vehicleType` VARCHAR(50) NOT NULL,
    `licenseNumber` VARCHAR(20) NOT NULL,
    `id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `deliveryPerson_id_key`(`id`),
    PRIMARY KEY (`userName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kitchenStaff` (
    `userName` VARCHAR(50) NOT NULL,
    `restaurantId` INTEGER NOT NULL,

    PRIMARY KEY (`userName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menuItems` (
    `name` VARCHAR(20) NOT NULL,
    `photo` VARCHAR(100) NULL,
    `menuCategory` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `finalPrice` DECIMAL(10, 2) NULL,
    `available` BOOLEAN NULL,
    `description` VARCHAR(200) NULL,
    `discount` DECIMAL(10, 2) NULL,
    `restaurantId` INTEGER NOT NULL,

    PRIMARY KEY (`name`, `restaurantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `onDeliverOrders` (
    `deliveryTime` DECIMAL(10, 2) NULL,
    `deliveryId` VARCHAR(50) NOT NULL,
    `tipAmount` DECIMAL(10, 2) NULL,
    `orderId` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `onPrepareOrders` (
    `preparingTime` DECIMAL(10, 2) NULL,
    `kitchenStaffId` VARCHAR(50) NOT NULL,
    `orderId` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderItems` (
    `quantity` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `itemName` VARCHAR(20) NOT NULL,
    `restaurantId` INTEGER NULL,

    PRIMARY KEY (`orderId`, `itemName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderReview` (
    `deliverRating` DECIMAL(10, 2) NULL,
    `restaurantRating` DECIMAL(10, 2) NULL,
    `customerId` VARCHAR(50) NOT NULL,
    `orderId` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orders` (
    `orderId` INTEGER NOT NULL AUTO_INCREMENT,
    `location` VARCHAR(100) NOT NULL,
    `orderTime` DATE NOT NULL,
    `itemsPrice` DECIMAL(10, 2) NOT NULL,
    `deliveryFee` DECIMAL(10, 2) NULL,
    `status` VARCHAR(20) NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,
    `restaurantId` INTEGER NOT NULL,

    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `paymentId` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentStatus` VARCHAR(20) NOT NULL,
    `time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentWithCard_Wallet` (
    `paymentAmount` DOUBLE NULL,
    `paymentId` INTEGER NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,
    `number` VARCHAR(20) NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentWithCoupons` (
    `paymentAmount` DOUBLE NULL,
    `paymentId` INTEGER NOT NULL,
    `couponId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentWithSubscription` (
    `paymentAmount` DOUBLE NULL,
    `paymentId` INTEGER NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,
    `subscriptionId` VARCHAR(50) NOT NULL,
    `restaurantID` INTEGER NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`paymentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proccessedTickets` (
    `responseMessage` VARCHAR(200) NOT NULL,
    `responseTime` DATETIME(3) NOT NULL,
    `ticketId` INTEGER NOT NULL,
    `supportId` VARCHAR(50) NULL,

    PRIMARY KEY (`ticketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `restaurantId` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(50) NOT NULL,
    `photo` VARCHAR(100) NULL,
    `openingHours` VARCHAR(20) NOT NULL,
    `restaurantName` VARCHAR(50) NOT NULL,
    `description` VARCHAR(200) NULL,
    `location` VARCHAR(100) NOT NULL,
    `managerID` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Restaurant_restaurantName_key`(`restaurantName`),
    PRIMARY KEY (`restaurantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurantChat` (
    `messageId` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(100) NOT NULL,
    `timeSent` DATETIME(3) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `SRFlag` CHAR(1) NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurantOwner` (
    `userName` VARCHAR(50) NOT NULL,
    `bankId` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`userName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `planName` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `restaurantID` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `FreeDelivery` BOOLEAN NULL,
    `period` INTEGER NOT NULL,

    PRIMARY KEY (`planName`, `restaurantID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tickets` (
    `ticketId` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(50) NULL,
    `message` VARCHAR(200) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NULL,
    `customerId` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`ticketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallets_Cards` (
    `number` VARCHAR(20) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `customerId` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`number`, `customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `userName` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `photo` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `type` CHAR(1) NOT NULL,
    `passwordChangedAt` DATETIME(3) NULL,

    PRIMARY KEY (`userName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Coupons` ADD CONSTRAINT `Coupons_restaurantID_fkey` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant`(`restaurantId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customerAddress` ADD CONSTRAINT `customerAddress_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customerSubscription` ADD CONSTRAINT `customerSubscription_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customerSubscription` ADD CONSTRAINT `customerSubscription_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customerSubscription` ADD CONSTRAINT `customerSubscription_subscriptionId_restaurantID_fkey` FOREIGN KEY (`subscriptionId`, `restaurantID`) REFERENCES `Subscription`(`planName`, `restaurantID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `deliveryChat` ADD CONSTRAINT `deliveryChat_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `deliveryPerson` ADD CONSTRAINT `deliveryPerson_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kitchenStaff` ADD CONSTRAINT `kitchenStaff_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`restaurantId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kitchenStaff` ADD CONSTRAINT `kitchenStaff_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `menuItems` ADD CONSTRAINT `menuItems_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`restaurantId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `onDeliverOrders` ADD CONSTRAINT `onDeliverOrders_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `deliveryPerson`(`userName`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `onDeliverOrders` ADD CONSTRAINT `onDeliverOrders_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `onPrepareOrders` ADD CONSTRAINT `onPrepareOrders_kitchenStaffId_fkey` FOREIGN KEY (`kitchenStaffId`) REFERENCES `kitchenStaff`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `onPrepareOrders` ADD CONSTRAINT `onPrepareOrders_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_itemName_restaurantId_fkey` FOREIGN KEY (`itemName`, `restaurantId`) REFERENCES `menuItems`(`name`, `restaurantId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orderReview` ADD CONSTRAINT `orderReview_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orderReview` ADD CONSTRAINT `orderReview_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`restaurantId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCard_Wallet` ADD CONSTRAINT `paymentWithCard_Wallet_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCard_Wallet` ADD CONSTRAINT `paymentWithCard_Wallet_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCard_Wallet` ADD CONSTRAINT `paymentWithCard_Wallet_number_customerId_fkey` FOREIGN KEY (`number`, `customerId`) REFERENCES `Wallets_Cards`(`number`, `customerId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCoupons` ADD CONSTRAINT `paymentWithCoupons_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupons`(`couponId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCoupons` ADD CONSTRAINT `paymentWithCoupons_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithCoupons` ADD CONSTRAINT `paymentWithCoupons_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithSubscription` ADD CONSTRAINT `paymentWithSubscription_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithSubscription` ADD CONSTRAINT `paymentWithSubscription_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`paymentId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paymentWithSubscription` ADD CONSTRAINT `paymentWithSubscription_customerId_subscriptionId_restauran_fkey` FOREIGN KEY (`customerId`, `subscriptionId`, `restaurantID`) REFERENCES `customerSubscription`(`customerId`, `subscriptionId`, `restaurantID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proccessedTickets` ADD CONSTRAINT `proccessedTickets_supportId_fkey` FOREIGN KEY (`supportId`) REFERENCES `Users`(`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proccessedTickets` ADD CONSTRAINT `proccessedTickets_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Tickets`(`ticketId`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_managerID_fkey` FOREIGN KEY (`managerID`) REFERENCES `restaurantOwner`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurantChat` ADD CONSTRAINT `restaurantChat_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Orders`(`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `restaurantOwner` ADD CONSTRAINT `restaurantOwner_userName_fkey` FOREIGN KEY (`userName`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_restaurantID_fkey` FOREIGN KEY (`restaurantID`) REFERENCES `Restaurant`(`restaurantId`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Tickets` ADD CONSTRAINT `Tickets_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Wallets_Cards` ADD CONSTRAINT `Wallets_Cards_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Users`(`userName`) ON DELETE CASCADE ON UPDATE NO ACTION;
