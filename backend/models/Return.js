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
    allowNull: true,
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
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'received', 'verified', 'completed'),
    defaultValue: 'pending',
  },
  notes: { // Customer notes
    type: DataTypes.TEXT,
  },
  adminNote: {
    type: DataTypes.TEXT,
  },
  rejectionReason: {
    type: DataTypes.STRING,
  },
  returnNumber: {
    type: DataTypes.STRING,
  },
  requestedAt: {
    type: DataTypes.DATE,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  receivedAt: {
    type: DataTypes.DATE,
  },
  verifiedAt: {
    type: DataTypes.DATE,
  },
  completedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'returns',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Return;
