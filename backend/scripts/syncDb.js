require('dotenv').config();
const { sequelize } = require('../models');

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    console.log('Altering database to match models...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
}

syncDb();
