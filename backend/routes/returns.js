const express = require('express');
const router = express.Router();
const { Return, ReturnItem, Sale, SaleItem, Product, Customer, User, StockLog, sequelize } = require('../models');
const { auth, roleCheck } = require('../middleware/auth');

// GET all returns (Admin)
router.get('/', auth, roleCheck(['admin', 'manager', 'cashier']), async (req, res) => {
  try {
    const returns = await Return.findAll({
      include: [
        { model: Sale, attributes: ['id', 'totalAmount', 'orderStatus', 'createdAt'] },
        { model: Customer, attributes: ['id', 'name', 'phone', 'email'] },
        { model: User, attributes: ['id', 'name'] }, // Employee who handled it
        { 
          model: ReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product, attributes: ['id', 'name', 'sku', 'price'] }, { model: SaleItem }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(returns);
  } catch (error) {
    console.error("GET / error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET returns for a specific customer
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const returns = await Return.findAll({
      where: { customerId: req.params.customerId },
      include: [
        { model: Sale, attributes: ['id', 'totalAmount', 'orderStatus'] },
        { 
          model: ReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product, attributes: ['id', 'name', 'sku'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(returns);
  } catch (error) {
    console.error("GET /customer/:customerId error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET a single return
router.get('/:id', auth, async (req, res) => {
  try {
    const returnData = await Return.findByPk(req.params.id, {
      include: [
        { model: Sale },
        { model: Customer },
        { model: User },
        { 
          model: ReturnItem, 
          as: 'ReturnItems',
          include: [{ model: Product }, { model: SaleItem }]
        }
      ]
    });
    if (!returnData) return res.status(404).json({ message: 'Return not found' });
    res.json(returnData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a return (Customer or Admin)
router.post('/', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { saleId, returnItems, returnReason, notes, customerId } = req.body;
    
    // Find original sale
    const sale = await Sale.findByPk(saleId, {
      include: [{ model: SaleItem, as: 'Items' }],
      transaction: t
    });
    
    if (!sale) throw new Error('Sale not found');
    
    // Allow returns only if delivered (if online) or active (POS)
    // Using simple business logic check here
    
    let totalRefund = 0;
    const returnNum = 'RET-' + Math.floor(100000 + Math.random() * 900000);
    
    const newReturn = await Return.create({
      saleId,
      customerId: customerId || sale.customerId,
      userId: req.user ? req.user.id : null,
      returnNumber: returnNum,
      returnReason,
      status: 'pending',
      notes, // Customer notes
      totalRefund: 0,
      requestedAt: new Date(),
    }, { transaction: t });

    for (const item of returnItems) {
      const saleItem = sale.Items.find(si => si.id === item.saleItemId);
      if (!saleItem) throw new Error(`Sale item ${item.saleItemId} not found in this sale`);

      // Calculate refund amount strictly on the backend to avoid frontend manipulation
      // Assume proportion of discount applies if there was an item-level discount
      const refundAmount = (parseFloat(saleItem.price) - parseFloat(saleItem.discountAmount || 0)) * item.quantity;
      totalRefund += refundAmount;

      await ReturnItem.create({
        returnId: newReturn.id,
        productId: saleItem.productId,
        saleItemId: saleItem.id,
        quantity: item.quantity,
        condition: 'new', // Default until inspected
        refundAmount: refundAmount
      }, { transaction: t });
    }

    newReturn.totalRefund = totalRefund;
    await newReturn.save({ transaction: t });
    
    // Update sale status to Return Requested
    await sale.update({ orderStatus: 'Return Requested' }, { transaction: t });

    await t.commit();
    res.status(201).json(newReturn);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
});

// PATCH approve/reject return
router.patch('/:id/status', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { status, adminNote, rejectionReason } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const returnReq = await Return.findByPk(req.params.id, { include: [Sale] });
    if (!returnReq) return res.status(404).json({ message: 'Return not found' });
    
    if (returnReq.status === 'completed') {
       return res.status(400).json({ message: 'Return is already completed' });
    }

    returnReq.status = status;
    returnReq.adminNote = adminNote || returnReq.adminNote;
    
    if (status === 'approved') {
      returnReq.approvedAt = new Date();
      if (returnReq.Sale) await returnReq.Sale.update({ orderStatus: 'Return Approved' });
    } else if (status === 'rejected') {
      returnReq.rejectionReason = rejectionReason;
      if (returnReq.Sale) await returnReq.Sale.update({ orderStatus: 'Return Rejected' });
    }

    await returnReq.save();
    res.json(returnReq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH receive return & verify conditions
router.patch('/:id/receive', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { itemsConditions } = req.body; // Array of { returnItemId, condition }
    const returnReq = await Return.findByPk(req.params.id, { 
      include: [{ model: ReturnItem, as: 'ReturnItems' }, Sale],
      transaction: t 
    });

    if (!returnReq) throw new Error('Return not found');
    if (returnReq.status !== 'approved') throw new Error('Return must be approved first');

    // Update conditions
    if (itemsConditions && itemsConditions.length > 0) {
      for (const cond of itemsConditions) {
        const item = returnReq.ReturnItems.find(ri => ri.id === cond.returnItemId);
        if (item) {
          await item.update({ condition: cond.condition }, { transaction: t });
        }
      }
    }

    returnReq.status = 'received';
    returnReq.receivedAt = new Date();
    returnReq.verifiedAt = new Date(); // Doing verification together with receive for simplicity
    
    if (returnReq.Sale) {
      await returnReq.Sale.update({ orderStatus: 'Returned' }, { transaction: t });
    }

    await returnReq.save({ transaction: t });
    await t.commit();
    res.json(returnReq);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
});

// PATCH complete return (Financial and Inventory updates)
router.patch('/:id/complete', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const returnReq = await Return.findByPk(req.params.id, {
      include: [{ model: ReturnItem, as: 'ReturnItems' }, Sale],
      transaction: t
    });

    if (!returnReq) throw new Error('Return not found');
    if (returnReq.status === 'completed') throw new Error('Return is already completed');
    if (returnReq.status !== 'received' && returnReq.status !== 'verified') {
      throw new Error('Return must be received and verified before completion');
    }

    // Process Inventory
    for (const item of returnReq.ReturnItems) {
      if (item.inventoryUpdated) continue;

      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (item.condition === 'Good' || item.condition === 'new') {
        product.stock += item.quantity;
      }
      
      await product.save({ transaction: t });

      // Log the inventory movement
      await StockLog.create({
        productId: product.id,
        userId: req.user.id,
        change: (item.condition === 'Good' || item.condition === 'new') ? item.quantity : 0,
        type: 'return',
        notes: `Returned item from Sale ${returnReq.saleId} - Condition: ${item.condition}`,
        reference: returnReq.id
      }, { transaction: t });

      await item.update({ inventoryUpdated: true }, { transaction: t });
    }

    // Process Financials (Refund / Credit Balance)
    if (returnReq.customerId) {
      const customer = await Customer.findByPk(returnReq.customerId, { transaction: t });
      if (customer) {
        // Adjust dues/balance: We increase creditBalance. 
        // This acts as a refund or reduces dues in standard ERP accounting.
        customer.creditBalance = parseFloat(customer.creditBalance || 0) + parseFloat(returnReq.totalRefund || 0);
        await customer.save({ transaction: t });
      }
    }

    returnReq.status = 'completed';
    returnReq.completedAt = new Date();
    await returnReq.save({ transaction: t });
    
    if (returnReq.Sale) {
      await returnReq.Sale.update({ orderStatus: 'Refunded' }, { transaction: t });
    }

    await t.commit();
    res.json(returnReq);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
