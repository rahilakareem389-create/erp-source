const express = require('express');
const router = express.Router();
const { Return, ReturnItem, Sale, SaleItem, Product, Customer, User, StockLog, sequelize } = require('../models');
const { auth, roleCheck } = require('../middleware/auth');

// GET all returns
router.get('/', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const returns = await Return.findAll({
      include: [
        { model: Sale, attributes: ['id', 'totalAmount'] },
        { model: Customer, attributes: ['id', 'name', 'phone'] },
        { model: User, attributes: ['id', 'name'] },
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
    res.status(500).json({ message: error.message });
  }
});

// GET a single return
router.get('/:id', auth, roleCheck(['admin', 'manager']), async (req, res) => {
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

// POST create a return
router.post('/', auth, roleCheck(['admin', 'manager', 'cashier']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { saleId, returnItems, returnReason, type, notes } = req.body;
    
    // Find original sale
    const sale = await Sale.findByPk(saleId, {
      include: [{ model: SaleItem, as: 'Items' }],
      transaction: t
    });
    
    if (!sale) throw new Error('Sale not found');

    let totalRefund = 0;
    
    // Create the Return record
    const newReturn = await Return.create({
      saleId,
      customerId: sale.customerId,
      userId: req.user.id,
      returnReason,
      type: type || 'refund',
      status: 'pending',
      notes,
      totalRefund: 0 // Will update after calculating items
    }, { transaction: t });

    // Process return items
    for (const item of returnItems) {
      const saleItem = sale.Items.find(si => si.id === item.saleItemId);
      if (!saleItem) throw new Error(`Sale item ${item.saleItemId} not found in this sale`);

      // Check previously returned quantity for this sale item
      const previouslyReturned = await ReturnItem.sum('quantity', {
        where: { saleItemId: item.saleItemId },
        include: [{
          model: Return,
          where: { status: ['pending', 'approved', 'completed'] }
        }],
        transaction: t
      });

      const returnedCount = previouslyReturned || 0;
      const remainingAllowed = saleItem.quantity - returnedCount;

      if (item.quantity > remainingAllowed) {
        throw new Error(`Cannot return ${item.quantity} of product ${saleItem.productId}. Only ${remainingAllowed} available for return.`);
      }

      // Calculate refund amount
      const refundAmount = (parseFloat(saleItem.price) - parseFloat(saleItem.discountAmount || 0)) * item.quantity;
      totalRefund += refundAmount;

      await ReturnItem.create({
        returnId: newReturn.id,
        productId: saleItem.productId,
        saleItemId: saleItem.id,
        quantity: item.quantity,
        condition: item.condition || 'new',
        refundAmount: refundAmount
      }, { transaction: t });
    }

    newReturn.totalRefund = totalRefund;
    await newReturn.save({ transaction: t });

    await t.commit();
    res.status(201).json(newReturn);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
});

// PATCH complete return
router.patch('/:id/complete', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const returnReq = await Return.findByPk(req.params.id, {
      include: [{ model: ReturnItem, as: 'ReturnItems' }],
      transaction: t
    });

    if (!returnReq) throw new Error('Return not found');
    if (returnReq.status === 'completed') throw new Error('Return is already completed');
    if (returnReq.status === 'rejected') throw new Error('Cannot complete a rejected return');

    // Update inventory for each returned item
    for (const item of returnReq.ReturnItems) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (item.condition === 'new') {
        product.stock += item.quantity;
        product.returnedStock = (product.returnedStock || 0) + item.quantity;
      } else if (item.condition === 'damaged') {
        product.damagedStock = (product.damagedStock || 0) + item.quantity;
      }

      await product.save({ transaction: t });

      // Log the inventory movement
      await StockLog.create({
        productId: product.id,
        userId: req.user.id,
        change: item.quantity,
        type: 'return',
        notes: `Returned item from Sale ${returnReq.saleId} - Condition: ${item.condition}`,
        reference: returnReq.id
      }, { transaction: t });
    }

    returnReq.status = 'completed';
    await returnReq.save({ transaction: t });

    // Optional: could create an expense or payment log for the refund here.

    await t.commit();
    res.json(returnReq);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
});

// PATCH approve/reject return
router.patch('/:id/status', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const returnReq = await Return.findByPk(req.params.id);
    if (!returnReq) return res.status(404).json({ message: 'Return not found' });
    
    if (returnReq.status === 'completed') {
       return res.status(400).json({ message: 'Return is already completed' });
    }

    returnReq.status = status;
    await returnReq.save();
    res.json(returnReq);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
