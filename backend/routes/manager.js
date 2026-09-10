const express = require('express');
const { Sale, SalesSession, Employee, Department, Designation, User, Attendance, Leave, Product, Return, ReturnItem, SaleItem } = require('../models');
const { auth, roleCheck } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');
const router = express.Router();

// 🟢 GET /api/manager/dashboard
router.get('/dashboard', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const startOfCycle = new Date();
    startOfCycle.setDate(1);
    startOfCycle.setHours(0, 0, 0, 0);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      salesTodayCount,
      salesTodayTotal,
      monthlySales,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalReturns,
      pendingReturns
    ] = await Promise.all([
      Sale.count({ where: { createdAt: { [Op.gte]: startOfDay }, status: 'active' } }),
      Sale.sum('grandTotal', { where: { createdAt: { [Op.gte]: startOfDay }, status: 'active' } }),
      Sale.sum('grandTotal', { where: { createdAt: { [Op.gte]: startOfCycle }, status: 'active' } }),
      Sale.count({ where: { status: 'held' } }), // Assuming 'held' means pending
      Product.count(),
      Product.count({ where: { stock: { [Op.lt]: 10 } } }), // Assuming threshold is 10
      Return.count(),
      Return.count({ where: { status: 'pending' } })
    ]);

    // Recent Sales
    const recentSales = await Sale.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });

    const pendingOnlineOrders = await Sale.findAll({
      where: { orderStatus: 'Pending' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });

    res.json({
      revenue: parseFloat(monthlySales || 0),
      salesToday: parseFloat(salesTodayTotal || 0),
      salesCount: salesTodayCount || 0,
      pendingOrders: pendingOrders || 0,
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts || 0,
      totalReturns: totalReturns || 0,
      pendingReturns: pendingReturns || 0,
      recentSales,
      pendingOnlineOrders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 GET /api/manager/sales-summary (Chart Data)
router.get('/sales-summary', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    let startDate = new Date();
    
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (range === 'this_month') startDate.setDate(1);
    
    startDate.setHours(0, 0, 0, 0);

    const sales = await Sale.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
        status: 'active'
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('SUM', col('grandTotal')), 'total']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/manager/leaves/pending ─────────────────────────────────────────
// All pending leave requests for manager approval
router.get('/leaves/pending', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { status: 'pending' },
      include: [{
        model: Employee,
        attributes: ['id', 'firstName', 'lastName', 'position'],
      }],
      order: [['createdAt', 'ASC']],
    });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/manager/leaves/:id ─────────────────────────────────────────────
// Approve or reject a leave request
router.put('/leaves/:id', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    await leave.update({ status, rejectionReason: rejectionReason || null, approvedBy: req.user.id });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── GET /api/manager/staff/active ───────────────────────────────────────────
// Staff currently clocked in (no clockOut yet today)
router.get('/staff/active', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = await Attendance.findAll({
      where: {
        clockIn: { [Op.gte]: today },
        clockOut: null,
      },
      include: [{
        model: Employee,
        attributes: ['id', 'firstName', 'lastName', 'position'],
        include: [{ model: Department, attributes: ['name'] }],
      }],
      order: [['clockIn', 'ASC']],
    });

    res.json(active);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/manager/employees ──────────────────────────────────────────────
router.get('/employees', auth, roleCheck(['admin', 'manager']), async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: User,        attributes: ['id', 'name', 'email', 'role'] },
        { model: Department,  attributes: ['id', 'name'] },
        { model: Designation, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
