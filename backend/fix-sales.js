const { sequelize } = require('./models');

async function fixSales() {
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM `sales` LIKE 'orderStatus'");
    if (results.length === 0) {
      console.log('Adding orderStatus to sales...');
      await sequelize.query("ALTER TABLE `sales` ADD COLUMN `orderStatus` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded', 'Cancelled') DEFAULT 'Pending'");
      console.log('Added orderStatus.');
    } else {
      console.log('orderStatus already exists in sales.');
    }
    
    // Also check inventoryUpdated in return_items
    try {
      const [ri] = await sequelize.query("SHOW COLUMNS FROM `return_items` LIKE 'inventoryUpdated'");
      if (ri.length === 0) {
        console.log('Adding inventoryUpdated to return_items');
        await sequelize.query("ALTER TABLE `return_items` ADD COLUMN `inventoryUpdated` TINYINT(1) DEFAULT 0");
      }
    } catch(e) {}
    
    try {
      const [r1] = await sequelize.query("SHOW COLUMNS FROM `returns` LIKE 'returnNumber'");
      if (r1.length === 0) {
         await sequelize.query("ALTER TABLE `returns` ADD COLUMN `returnNumber` VARCHAR(255) NULL");
         await sequelize.query("ALTER TABLE `returns` ADD COLUMN `adminNote` TEXT NULL");
         await sequelize.query("ALTER TABLE `returns` ADD COLUMN `rejectionReason` TEXT NULL");
      }
    } catch(e) {}

    process.exit(0);
  } catch (e) {
    console.error('Full Error:', e);
    process.exit(1);
  }
}

fixSales();
