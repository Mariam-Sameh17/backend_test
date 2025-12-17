-- DropForeignKey
ALTER TABLE `orderItems` DROP FOREIGN KEY `orderItems_itemName_restaurantId_fkey`;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_itemName_restaurantId_fkey` FOREIGN KEY (`itemName`, `restaurantId`) REFERENCES `menuItems`(`name`, `restaurantId`) ON DELETE CASCADE ON UPDATE CASCADE;
