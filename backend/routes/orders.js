const express = require('express');
const { Sale, sequelize } = require('../models');
const { auth, roleCheck } = require('../middleware/auth');
const router = express.Router();

router.put('/:id/status', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    
    sale.orderStatus = req.body.status;
    await sale.save();
    
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
