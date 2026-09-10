const express = require('express');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    const supplied = (password || '').trim();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials (no password set)' });
    }

    const passwordMatches = await user.comparePassword(supplied);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact administration.' });
    }

    // Transparent re-hash if cost factor < 12
    try {
      const rounds = bcrypt.getRounds(user.passwordHash);
      if (rounds < 12) {
        const newHash = await bcrypt.hash(supplied, 12);
        await user.update({ passwordHash: newHash });
      }
    } catch (hashErr) {
      console.error('Bcrypt getRounds error:', hashErr);
      // Proceed even if re-hash fails
    }

    const secret = process.env.JWT_SECRET || 'erp_secret_key_2026';
    const token = jwt.sign({ id: user.id, role: user.role }, secret);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message || 'Internal server error during login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, phone and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with that email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ name, email, phone, role: 'cashier', passwordHash });

    const secret = process.env.JWT_SECRET || 'erp_secret_key_2026';
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, secret);
    const user = newUser.toJSON();
    delete user.passwordHash;

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.isCustomer) {
      const { Customer } = require('../models');
      const customer = await Customer.findByPk(req.user.id);
      return res.json({ id: customer.id, name: customer.name, email: customer.email, role: 'customer' });
    }
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/customer-login', async (req, res) => {
  try {
    const { email } = req.body;
    const { Customer } = require('../models');
    let customer = await Customer.findOne({ where: { email } });
    
    // For demo purposes, we will auto-create or mock-login by email
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found. Please register via ERP admin.' });
    }

    const secret = process.env.JWT_SECRET || 'erp_secret_key_2026';
    const token = jwt.sign({ id: customer.id, isCustomer: true, email: customer.email }, secret);
    res.json({ token, user: { id: customer.id, name: customer.name, email: customer.email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/customer-register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const { Customer } = require('../models');
    
    let customer = await Customer.findOne({ where: { email } });
    if (customer) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    customer = await Customer.create({ name, email, phone });
    const secret = process.env.JWT_SECRET || 'erp_secret_key_2026';
    const token = jwt.sign({ id: customer.id, isCustomer: true, email: customer.email }, secret);
    res.status(201).json({ token, user: { id: customer.id, name: customer.name, email: customer.email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
