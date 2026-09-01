// ======================================================
// src/api.js
// COMPLETE API FILE
// ======================================================

import axios from 'axios';
import { mockDB } from './utils/mockDB';

// ======================================================
// AXIOS INSTANCE
// ======================================================

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// AUTH TOKEN
// ======================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// GLOBAL RESPONSE HANDLER
// ======================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    console.error('API ERROR:', {
      status,
      url,
      message: error?.response?.data?.message,
      data: error?.response?.data,
    });

    if (status === 401) {
      if (!url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ======================================================
// AUTH API
// ======================================================

export const authAPI = {
  login: async (data) => {
    // --------------------------------------------------
    // MOCK ADMIN LOGIN
    // --------------------------------------------------

    if (
      data?.email === 'admin@erp.com' &&
      data?.password === 'admin123'
    ) {
      return {
        data: {
          token: 'mock-jwt-token',

          user: {
            id: 1,
            name: 'System Admin',
            role: 'admin',
            email: 'admin@erp.com',
          },
        },
      };
    }

    // --------------------------------------------------
    // REAL BACKEND LOGIN
    // --------------------------------------------------

    try {
      return await API.post('/auth/login', data);
    } catch (error) {
      throw error;
    }
  },

  register: async (data) => {
    try {
      return await API.post('/auth/register', data);
    } catch (error) {
      console.error('Register Error:', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      return await API.get('/auth/me');
    } catch (error) {
      console.error('Get Me Error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return {
        data: {
          message: 'Logged out successfully',
        },
      };
    } catch (error) {
      throw error;
    }
  },
};

// ======================================================
// SALES API
// ======================================================

export const salesAPI = {
  getAnalytics: () =>
    Promise.resolve({
      data: {
        revenue: 15400,
        sales: 320,
        target: 20000,
        growth: 12,
      },
    }),

  getHistory: () =>
    Promise.resolve({
      data: [
        {
          id: 1,
          date: '2026-08-07',
          total: 150,
          items: 3,
          status: 'Completed',
        },
      ],
    }),

  getHeldSales: () =>
    Promise.resolve({
      data: [],
    }),

  getTodayStats: () =>
    Promise.resolve({
      data: {
        total: 15400,
        count: 120,
      },
    }),

  createSale: (data) =>
    Promise.resolve({
      data: {
        ...data,
        id: Date.now(),
        message: 'Sale created successfully',
      },
    }),

  voidSale: (id, reason) =>
    Promise.resolve({
      data: {
        id,
        reason,
        message: 'Sale voided successfully',
      },
    }),

  applyPromo: (code) =>
    Promise.resolve({
      data: {
        code,
        discount: 10,
      },
    }),

  getEOD: () =>
    Promise.resolve({
      data: {
        expected: 15400,
        actual: 15400,
      },
    }),

  closeEOD: (data) =>
    Promise.resolve({
      data: {
        ...data,
        message: 'EOD closed successfully',
      },
    }),
};

// ======================================================
// CUSTOMER API
// ======================================================

export const customerAPI = {
  getCustomers: () =>
    Promise.resolve({
      data: [
        {
          id: 1,
          name: 'Acme Corp',
          email: 'contact@acme.com',
          phone: '0501112222',
          totalSpent: 14500,
          outstanding: 0,
        },
        {
          id: 2,
          name: 'BuildRite Inc',
          email: 'info@buildrite.com',
          phone: '0553334444',
          totalSpent: 8900,
          outstanding: 1200,
        },
      ],
    }),

  search: (q) =>
    Promise.resolve({
      data: [],
    }),

  create: (data) =>
    Promise.resolve({
      data: {
        ...data,
        id: Date.now(),
      },
    }),

  delete: (id) =>
    Promise.resolve({
      data: {
        id,
        message: 'Customer deleted',
      },
    }),

  getHistory: (id) =>
    Promise.resolve({
      data: [],
    }),

  payOutstanding: (id, data) =>
    Promise.resolve({
      data: {
        id,
        ...data,
        message: 'Payment completed',
      },
    }),

  getLoyaltyTransactions: (id) =>
    Promise.resolve({
      data: [],
    }),
};

// ======================================================
// INVENTORY API
// ======================================================

export const inventoryAPI = {
  getProducts: () =>
    Promise.resolve({
      data: [
        {
          id: 1,
          name: 'Portland Cement 50kg',
          sku: 'CEM-50',
          price: 15,
          costPrice: 12,
          stock: 150,
          Category: {
            name: 'Materials',
          },
          manufacturer: 'Lafarge',
        },
        {
          id: 2,
          name: 'Steel Rebar 12mm',
          sku: 'STL-12',
          price: 8,
          costPrice: 6,
          stock: 500,
          Category: {
            name: 'Materials',
          },
          manufacturer: 'SABIC',
        },
        {
          id: 3,
          name: 'Safety Helmet',
          sku: 'SAF-H1',
          price: 25,
          costPrice: 15,
          stock: 8,
          Category: {
            name: 'Safety',
          },
          manufacturer: '3M',
        },
      ],
    }),

  addProduct: (data) =>
    Promise.resolve({
      data: {
        ...data,
        id: Date.now(),
      },
    }),

  updateProduct: (id, data) =>
    Promise.resolve({
      data: {
        ...data,
        id,
      },
    }),

  getAlerts: () =>
    Promise.resolve({
      data: {
        lowStock: [
          {
            id: 3,
            name: 'Safety Helmet',
            stock: 8,
          },
        ],
        expiringSoon: [],
      },
    }),

  restock: (data) =>
    Promise.resolve({
      data: {
        ...data,
        message: 'Restocked successfully',
      },
    }),

  getCategories: () =>
    Promise.resolve({
      data: [
        {
          id: 'c1',
          name: 'Materials',
        },
        {
          id: 'c2',
          name: 'Safety',
        },
        {
          id: 'c3',
          name: 'Tools',
        },
      ],
    }),

  adjustStock: (data) =>
    Promise.resolve({
      data: {
        ...data,
        message: 'Stock adjusted successfully',
      },
    }),

  getMovementLogs: () =>
    Promise.resolve({
      data: [],
    }),

  importCSV: (data) =>
    Promise.resolve({
      data: {
        ...data,
        message: 'CSV imported successfully',
      },
    }),

  getPredictive: () =>
    Promise.resolve({
      data: [],
    }),

  autoGeneratePO: () =>
    Promise.resolve({
      data: {
        message: 'Purchase order generated',
      },
    }),

  getAutoDiscount: () =>
    Promise.resolve({
      data: [],
    }),
};

// ======================================================
// HR API
// ======================================================

export const hrAPI = {
  getEmployees: () =>
    Promise.resolve({
      data: mockDB.data.employees,
    }),

  addEmployee: async (data) => {
    const employee = await mockDB.addEmployee(data);

    return {
      data: employee,
    };
  },

  getStats: async () => {
    const stats = await mockDB.getStats();

    return {
      data: stats,
    };
  },
};

// ======================================================
// SHIFT API
// ======================================================

export const shiftAPI = {
  getActiveShift: () =>
    API.get('/shifts/active'),

  startShift: () =>
    API.post('/shifts/start'),

  endShift: () =>
    API.post('/shifts/end'),

  getHistory: () =>
    API.get('/shifts/history'),
};

// ======================================================
// MANAGER API
// ======================================================

export const managerAPI = {
  getOverview: () =>
    API.get('/manager/overview'),

  getEmployees: () =>
    Promise.resolve({
      data: mockDB.data.employees,
    }),

  getSalesToday: () =>
    API.get('/manager/sales-today'),

  getPendingLeaves: () =>
    API.get('/leaves/pending'),

  updateLeave: (id, data) =>
    API.put(`/manager/leaves/${id}`, data),

  getActiveStaff: () =>
    API.get('/manager/staff/active'),
};

// ======================================================
// SETTINGS API
// ======================================================

export const settingsAPI = {
  get: () =>
    API.get('/settings'),

  update: (data) =>
    API.post('/settings', data),
};

// ======================================================
// EMPLOYEE API
// ======================================================

export const employeeAPI = {
  getAll: () =>
    Promise.resolve({
      data: mockDB.data.employees,
    }),

  getById: (id) =>
    Promise.resolve({
      data: mockDB.data.employees.find(
        (employee) =>
          String(employee.id) === String(id) ||
          String(employee._id) === String(id) ||
          String(employee.employeeId) === String(id)
      ),
    }),

  create: async (data) => {
    const employee = await mockDB.addEmployee(data);

    return {
      data: employee,
    };
  },

  update: async (id, data) => {
    const employee = await mockDB.updateEmployee(
      id,
      data
    );

    return {
      data: employee,
    };
  },

  delete: (id) =>
    Promise.resolve({
      data: {
        id,
        message: 'Employee deleted successfully',
      },
    }),

  getDepartments: () =>
    Promise.resolve({
      data: mockDB.data.departments,
    }),

  getProjects: () =>
    Promise.resolve({
      data: mockDB.data.projects,
    }),

  getDesignations: () =>
    API.get('/employees/designations'),

  resetPassword: (id, newPassword) =>
    API.post(
      `/employees/${id}/reset-password`,
      {
        newPassword,
      }
    ),
};

// ======================================================
// USERS API
// ======================================================

export const usersAPI = {
  getAll: () =>
    API.get('/users'),

  create: (data) =>
    API.post('/users', data),

  updateRole: (id, role) =>
    API.put(
      `/users/${id}/role`,
      {
        role,
      }
    ),

  delete: (id) =>
    API.delete(`/users/${id}`),

  toggleActive: (id) =>
    API.put(`/users/${id}/toggle-active`),
};

// ======================================================
// ATTENDANCE API
// ======================================================

export const attendanceAPI = {
  getToday: () =>
    Promise.resolve({
      data: mockDB.data.attendance.filter(
        (attendance) =>
          attendance.date ===
          new Date()
            .toISOString()
            .split('T')[0]
      ),
    }),

  getActive: () =>
    Promise.resolve({
      data: mockDB.data.attendance.filter(
        (attendance) =>
          !attendance.clockOut
      ),
    }),

  getMyActive: () =>
    Promise.resolve({
      data: mockDB.data.attendance.filter(
        (attendance) =>
          !attendance.clockOut &&
          attendance.employeeId === 'EMP-001'
      ),
    }),

  getMyHistory: () =>
    Promise.resolve({
      data: mockDB.data.attendance.filter(
        (attendance) =>
          attendance.employeeId === 'EMP-001'
      ),
    }),

  clockIn: (data) =>
    Promise.resolve({
      data: {
        ...data,
        message: 'Clocked in successfully',
      },
    }),

  clockOut: () =>
    Promise.resolve({
      data: {
        message: 'Clocked out successfully',
      },
    }),
};

// ======================================================
// OVERTIME API
// ======================================================

export const overtimeAPI = {
  getPending: () =>
    mockDB.getOvertime().then((data) => ({
      data: Array.isArray(data)
        ? data.filter(
            (item) =>
              String(item.status).toLowerCase() ===
              'pending'
          )
        : [],
    })),

  getAll: () =>
    mockDB.getOvertime().then((data) => ({
      data: Array.isArray(data)
        ? data
        : [],
    })),

  approve: (id) =>
    mockDB
      .updateOvertimeStatus(id, 'Approved')
      .then((data) => ({
        data,
      })),

  reject: (id) =>
    mockDB
      .updateOvertimeStatus(id, 'Rejected')
      .then((data) => ({
        data,
      })),
};

// ======================================================
// LEAVE API
// ======================================================

export const leaveAPI = {
  // ----------------------------------------------------
  // APPLY
  // ----------------------------------------------------

  apply: async (data) => {
    try {
      const response = await API.post(
        '/leaves/apply',
        data
      );

      return response;
    } catch (error) {
      console.error(
        'Apply Leave Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // MY LEAVES
  // ----------------------------------------------------

  getMy: async () => {
    try {
      const response = await API.get(
        '/leaves/my'
      );

      return response;
    } catch (error) {
      console.error(
        'Get My Leaves Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // MY BALANCE
  // ----------------------------------------------------

  getMyBalance: async () => {
    try {
      const response = await API.get(
        '/leaves/my-balance'
      );

      return response;
    } catch (error) {
      console.error(
        'Get My Leave Balance Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // GET ALL LEAVES
  // ----------------------------------------------------

  getAll: async () => {
    try {
      const response = await API.get(
        '/leaves'
      );

      let leaves = [];

      if (Array.isArray(response.data)) {
        leaves = response.data;
      } else if (
        Array.isArray(response.data?.leaves)
      ) {
        leaves = response.data.leaves;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        leaves = response.data.data;
      } else if (
        Array.isArray(response.data?.rows)
      ) {
        leaves = response.data.rows;
      }

      return {
        ...response,
        data: leaves,
      };
    } catch (error) {
      console.error(
        'Get All Leaves Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // GET PENDING LEAVES
  // ----------------------------------------------------

  getPending: async () => {
    try {
      const response = await API.get(
        '/leaves/pending'
      );

      let leaves = [];

      if (Array.isArray(response.data)) {
        leaves = response.data;
      } else if (
        Array.isArray(response.data?.leaves)
      ) {
        leaves = response.data.leaves;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        leaves = response.data.data;
      } else if (
        Array.isArray(response.data?.rows)
      ) {
        leaves = response.data.rows;
      }

      return {
        ...response,
        data: leaves,
      };
    } catch (error) {
      console.error(
        'Get Pending Leaves Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // UPDATE STATUS
  // ----------------------------------------------------

  updateStatus: async (
    id,
    status,
    reason = ''
  ) => {
    try {
      if (
        id === undefined ||
        id === null ||
        id === ''
      ) {
        throw new Error(
          'Leave ID is required.'
        );
      }

      const normalizedStatus = String(
        status || ''
      )
        .trim()
        .toLowerCase();

      const allowedStatuses = [
        'approved',
        'rejected',
        'withdrawn',
      ];

      if (
        !allowedStatuses.includes(
          normalizedStatus
        )
      ) {
        throw new Error(
          `Invalid leave status: ${normalizedStatus}`
        );
      }

      const payload = {
        status: normalizedStatus,

        rejectionReason:
          normalizedStatus === 'rejected'
            ? String(reason || '').trim() ||
              'Leave request rejected.'
            : null,
      };

      console.log(
        'UPDATE LEAVE STATUS:',
        {
          id,
          payload,
        }
      );

      const response = await API.put(
        `/leaves/${id}/status`,
        payload
      );

      return response;
    } catch (error) {
      console.error(
        'Update Leave Status Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // APPROVE
  // ----------------------------------------------------

  approve: async (id) => {
    return leaveAPI.updateStatus(
      id,
      'approved'
    );
  },

  // ----------------------------------------------------
  // REJECT
  // ----------------------------------------------------

  reject: async (
    id,
    reason = ''
  ) => {
    return leaveAPI.updateStatus(
      id,
      'rejected',
      reason
    );
  },

  // ----------------------------------------------------
  // WITHDRAW
  // ----------------------------------------------------

  withdraw: async (id) => {
    return leaveAPI.updateStatus(
      id,
      'withdrawn'
    );
  },

  // ----------------------------------------------------
  // EMPLOYEE LEAVE HISTORY
  // ----------------------------------------------------

  getByEmployee: async (id) => {
    try {
      if (
        id === undefined ||
        id === null ||
        id === ''
      ) {
        throw new Error(
          'Employee ID is required.'
        );
      }

      return await API.get(
        `/leaves/employee/${id}`
      );
    } catch (error) {
      console.error(
        'Get Employee Leaves Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },

  // ----------------------------------------------------
  // EMPLOYEE BALANCE
  // ----------------------------------------------------

  getBalanceByEmployee: async (id) => {
    try {
      if (
        id === undefined ||
        id === null ||
        id === ''
      ) {
        throw new Error(
          'Employee ID is required.'
        );
      }

      return await API.get(
        `/leaves/balance/${id}`
      );
    } catch (error) {
      console.error(
        'Get Employee Leave Balance Error:',
        error?.response?.data || error
      );

      throw error;
    }
  },
};

// ======================================================
// PAYROLL API
// ======================================================

export const payrollAPI = {
  run: (month, year) =>
    Promise.resolve({
      data: [],
    }),

  getHistory: () =>
    Promise.resolve({
      data: [],
    }),

  getPayslips: (runId) =>
    API.get(
      `/payroll/runs/${runId}/payslips`
    ),

  updatePayslip: (id, data) =>
    API.put(
      `/payroll/payslips/${id}`,
      data
    ),

  finalizeRun: (runId) =>
    API.put(
      `/payroll/runs/${runId}/finalize`
    ),
};

// ======================================================
// EXPENSE API
// ======================================================

export const expenseAPI = {
  getAll: () =>
    Promise.resolve({
      data: [
        {
          id: 1,
          date: '2026-08-01',
          description: 'Office Supplies',
          amount: 350,
          category: 'Admin',
          status: 'Approved',
          employeeId: 'EMP-002',
        },
        {
          id: 2,
          date: '2026-08-05',
          description: 'Site Transportation',
          amount: 1200,
          category: 'Logistics',
          status: 'Pending',
          employeeId: 'EMP-001',
        },
      ],
    }),

  getPending: () =>
    Promise.resolve({
      data: [
        {
          id: 2,
          date: '2026-08-05',
          description: 'Site Transportation',
          amount: 1200,
          category: 'Logistics',
          status: 'Pending',
          employeeId: 'EMP-001',
        },
      ],
    }),

  add: (data) =>
    Promise.resolve({
      data: {
        ...data,
        id: Date.now(),
      },
    }),

  update: (id, data) =>
    Promise.resolve({
      data: {
        ...data,
        id,
      },
    }),

  delete: (id) =>
    Promise.resolve({
      data: {
        id,
        message: 'Expense deleted',
      },
    }),

  updateStatus: (id, status) =>
    Promise.resolve({
      data: {
        id,
        status,
      },
    }),
};

// ======================================================
// SUPPLIER API
// ======================================================

export const supplierAPI = {
  getAll: () =>
    API.get('/suppliers'),

  add: (data) =>
    API.post('/suppliers', data),

  update: (id, data) =>
    API.put(
      `/suppliers/${id}`,
      data
    ),

  createOrder: (data) =>
    API.post(
      '/suppliers/orders',
      data
    ),

  getOrders: () =>
    API.get('/suppliers/orders'),

  receiveOrder: (id, data) =>
    API.put(
      `/suppliers/orders/${id}/receive`,
      data
    ),
};

// ======================================================
// ADMIN API
// ======================================================

export const adminAPI = {
  getDashboardStats: () =>
    API.get('/admin/dashboard'),

  getAuditLogs: (params) =>
    API.get(
      '/admin/audit-logs',
      {
        params,
      }
    ),

  getSettings: () =>
    API.get('/admin/settings'),

  updateSettings: (data) =>
    API.put(
      '/admin/settings',
      data
    ),
};

// ======================================================
// RIDES API
// ======================================================

export const ridesAPI = {
  getAll: () =>
    API.get('/rides'),

  create: (data) =>
    API.post('/rides', data),

  getDrivers: () =>
    API.get('/rides/drivers'),

  assign: (id, driverId) =>
    API.put(
      `/rides/${id}/assign`,
      {
        driverId,
      }
    ),

  updateStatus: (id, status) =>
    API.put(
      `/rides/${id}/status`,
      {
        status,
      }
    ),
};

// ======================================================
// REPORTS API
// ======================================================

export const reportsAPI = {
  getRevenue: () =>
    Promise.resolve({
      data: [
        {
          date: '2026-08-01',
          revenue: 4500,
        },
        {
          date: '2026-08-02',
          revenue: 5200,
        },
        {
          date: '2026-08-03',
          revenue: 4800,
        },
      ],
    }),

  getPnL: () =>
    Promise.resolve({
      data: [
        {
          category: 'Revenue',
          amount: 14500,
        },
        {
          category: 'COGS',
          amount: -6000,
        },
        {
          category: 'Operating Expenses',
          amount: -1500,
        },
      ],
    }),

  getTopProducts: () =>
    Promise.resolve({
      data: [
        {
          name: 'Portland Cement 50kg',
          totalSold: 120,
          revenue: 1800,
        },
        {
          name: 'Steel Rebar 12mm',
          totalSold: 85,
          revenue: 680,
        },
      ],
    }),

  getSalesperson: () =>
    Promise.resolve({
      data: [
        {
          name: 'Ahmed Abdullah',
          totalSales: 8500,
        },
        {
          name: 'Sarah Khalid',
          totalSales: 6000,
        },
      ],
    }),

  getDaily: () =>
    Promise.resolve({
      data: [],
    }),

  getCustomerReport: (id) =>
    Promise.resolve({
      data: {},
    }),
};

// ======================================================
// ADVANCE API
// ======================================================

export const advanceAPI = {
  request: (data) =>
    API.post(
      '/payroll/advance/request',
      data
    ),

  getMy: () =>
    API.get(
      '/payroll/advance/my'
    ),

  getAll: () =>
    Promise.resolve({
      data: mockDB.data.loans,
    }),

  approve: (id, status) =>
    API.put(
      `/payroll/advance/${id}/approve`,
      {
        status,
      }
    ),
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default API;