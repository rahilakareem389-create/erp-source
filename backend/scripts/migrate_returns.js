require('dotenv').config();
const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    
    // Add columns to products table if they don't exist
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('products');
    
    if (!tableInfo.damagedStock) {
      console.log('Adding damagedStock to products...');
      await queryInterface.addColumn('products', 'damagedStock', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
      });
    } else {
      console.log('damagedStock already exists on products.');
    }
    
    if (!tableInfo.returnedStock) {
      console.log('Adding returnedStock to products...');
      await queryInterface.addColumn('products', 'returnedStock', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
      });
    } else {
      console.log('returnedStock already exists on products.');
    }
    
    // Sync models to create returns and return_items
    console.log('Syncing Return and ReturnItem models...');
    const { Return, ReturnItem } = require('../models');
    await Return.sync({ alter: true });
    await ReturnItem.sync({ alter: true });
    
    console.log('Migration successful.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
