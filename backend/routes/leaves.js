const express = require('express');
const { Leave, LeaveBalance, Employee, User } = require('../models');
const { auth, roleCheck } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Helper to reliably find, link, or create employee profile for the authenticated user
async function resolveEmployee(userPayload) {
  if (!userPayload || !userPayload.id) return null;

  // 1. Direct match by userId
  let employee = await Employee.findOne({
    where: { userId: userPayload.id },
  });

  if (employee) return employee;

  // 2. Lookup user record
  const user = await User.findByPk(userPayload.id);
  if (!user) return null;

  // 3. Match employee by email and link userId
  if (user.email) {
    employee = await Employee.findOne({
      where: { email: user.email },
    });

    if (employee) {
      employee.userId = user.id;
      await employee.save();
      return employee;
    }
  }

  // 4. Auto-provision employee profile for administrative and staff accounts
  try {
    const nameParts = (user.name || 'Employee User').trim().split(' ');
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || (user.role ? user.role.toUpperCase() : 'Staff');
    const empCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    employee = await Employee.create({
      empCode,
      firstName,
      lastName,
      email: user.email,
      userId: user.id,
      position: user.role === 'admin' ? 'Administrator' : (user.role || 'Staff'),
      status: 'active',
    });

    return employee;
  } catch (createErr) {
    console.warn('Auto-create employee profile warning:', createErr.message);
    return null;
  }
}

// ─── POST /api/leaves/apply ─────────────────────────────────────────────
router.post('/apply', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, days, reason } = req.body;

    // Validate required fields
    if (!leaveType) {
      return res.status(400).json({ message: 'Leave type is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: 'Reason must be at least 5 characters.' });
    }

    // Find or link the employee profile for the logged-in user
    const employee = await resolveEmployee(req.user);

    if (!employee) {
      return res.status(400).json({
        message: 'No employee profile linked to your account. Please contact HR or add your employee profile in Employees section.',
      });
    }

    // Map frontend leave type to DB enum
    const typeMap = {
      'Annual Leave': 'annual',
      'Sick Leave': 'medical',
      'Casual Leave': 'casual',
      'Emergency Leave': 'other',
      'Maternity Leave': 'other',
      'Unpaid Leave': 'unpaid',
      'annual': 'annual',
      'medical': 'medical',
      'casual': 'casual',
      'other': 'other',
      'unpaid': 'unpaid',
    };

    const dbType = typeMap[leaveType] || 'other';

    // Calculate days if not provided
    let leaveDays = days;
    if (!leaveDays || leaveDays <= 0) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      leaveDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Create leave record
    const leave = await Leave.create({
      employeeId: employee.id,
      type: dbType,
      startDate,
      endDate,
      days: leaveDays,
      reason: reason.trim(),
      status: 'pending',
    });

    res.status(201).json({
      message: 'Leave request submitted successfully. Waiting for approval.',
      leave,
    });
  } catch (err) {
    console.error('POST /leaves/apply error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves/my ─────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const employee = await resolveEmployee(req.user);

    if (!employee) {
      return res.json([]);
    }

    const leaves = await Leave.findAll({
      where: { employeeId: employee.id },
      order: [['createdAt', 'DESC']],
    });

    res.json(leaves);
  } catch (err) {
    console.error('GET /leaves/my error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves/my-balance ─────────────────────────────────────────
router.get('/my-balance', auth, async (req, res) => {
  try {
    const employee = await resolveEmployee(req.user);

    if (!employee) {
      return res.json([]);
    }

    const balances = await LeaveBalance.findAll({
      where: { employeeId: employee.id },
    });

    res.json(balances);
  } catch (err) {
    console.error('GET /leaves/my-balance error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves (all leaves - admin/hr/manager) ────────────────────
router.get('/', auth, roleCheck(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: [
        {
          model: Employee,
          attributes: ['id', 'empCode', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(leaves);
  } catch (err) {
    console.error('GET /leaves error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves/pending ────────────────────────────────────────────
router.get('/pending', auth, roleCheck(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Employee,
          attributes: ['id', 'empCode', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(leaves);
  } catch (err) {
    console.error('GET /leaves/pending error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves/employee/:id ───────────────────────────────────────
router.get('/employee/:id', auth, roleCheck(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { employeeId: req.params.id },
      order: [['createdAt', 'DESC']],
    });

    res.json(leaves);
  } catch (err) {
    console.error('GET /leaves/employee/:id error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/leaves/balance/:id ────────────────────────────────────────
router.get('/balance/:id', auth, roleCheck(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const balances = await LeaveBalance.findAll({
      where: { employeeId: req.params.id },
    });

    res.json(balances);
  } catch (err) {
    console.error('GET /leaves/balance/:id error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/leaves/:id/status (approve/reject/withdraw) ──────────────
router.put('/:id/status', auth, roleCheck(['admin', 'hr', 'manager']), async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const { status, rejectionReason } = req.body;

    const allowedStatuses = ['approved', 'rejected', 'withdrawn'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    await leave.update({
      status,
      approvedBy: (status === 'approved' || status === 'rejected') ? req.user.id : leave.approvedBy,
      rejectionReason: status === 'rejected' ? (rejectionReason || 'Leave request rejected.') : leave.rejectionReason,
    });

    // Update leave balance if approved
    if (status === 'approved') {
      const balance = await LeaveBalance.findOne({
        where: {
          employeeId: leave.employeeId,
          type: leave.type,
        },
      });

      if (balance) {
        await balance.update({
          used: parseFloat(balance.used) + parseFloat(leave.days),
        });
      }
    }

    res.json({
      message: `Leave request ${status} successfully.`,
      leave,
    });
  } catch (err) {
    console.error('PUT /leaves/:id/status error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;