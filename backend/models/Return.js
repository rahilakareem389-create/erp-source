const uuidv7 = () => require('crypto').randomUUID();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv7,
    primaryKey: true,
  },
  saleId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  userId: { // The employee who processed the return
    type: DataTypes.UUID,
    allowNull: false,
  },
  totalRefund: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  returnReason: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.ENUM('refund', 'exchange'),
    defaultValue: 'refund',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'returns',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Return;
