import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import Sidebar from './components/Sidebar';
import AIAgent from './components/AIAgent';
import NotificationCenter from './components/NotificationCenter';

// ======================================================
// PAGES
// ======================================================

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import HR from './pages/HR';

import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import EmployeeProfile from './pages/EmployeeProfile';

import Customers from './pages/Customers';
import Manager from './pages/Manager';
import Revenue from './pages/Revenue';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';

// ======================================================
// NEW EMPLOYEE LEAVE FORM
// ======================================================

import EmployeeLeaveForm from './pages/EmployeeLeaveForm';

import Payroll from './pages/Payroll';
import ShiftAudit from './pages/ShiftAudit';
import Suppliers from './pages/Suppliers';
import EODReport from './pages/EODReport';
import Expenses from './pages/Expenses';
import Delivery from './pages/Delivery';

import Login from './pages/Login';
import Landing from './pages/Landing';

import ProjectCosting from './pages/ProjectCosting';
import Loans from './pages/Loans';
import BIDashboard from './pages/BIDashboard';
import Reports from './pages/Reports';
import AlertCenter from './pages/AlertCenter';
import Overtime from './pages/Overtime';
import Migration from './pages/Migration';

// ======================================================
// AUTH
// ======================================================

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext';

import {
  LanguageProvider,
  useLanguage,
} from './context/LanguageContext';

import PrivateRoute from './components/PrivateRoute';

import {
  getDefaultRoute,
} from './utils/routing';

// ======================================================
// PAGE TRANSITION
// ======================================================

const PageTransition = ({ children }) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 15,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    exit={{
      opacity: 0,
      y: -15,
    }}
    transition={{
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {children}
  </motion.div>
);

// ======================================================
// APP CONTENT
// ======================================================

function AppContent() {
  const {
    token,
    user,
    logout,
  } = useAuth();

  const location = useLocation();

  const {
    isRTL,
  } = useLanguage();

  // ====================================================
  // PUBLIC ROUTES
  // ====================================================

  if (!token) {
    return (
      <Routes>

        {/* LANDING */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* PUBLIC PAGES */}

        <Route
          path="/payroll"
          element={<Payroll />}
        />

        <Route
          path="/overtime"
          element={<Overtime />}
        />

        <Route
          path="/project-costing"
          element={<ProjectCosting />}
        />

        <Route
          path="/loans"
          element={<Loans />}
        />

        <Route
          path="/bi-dashboard"
          element={<BIDashboard />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/alerts"
          element={<AlertCenter />}
        />

        <Route
          path="/migration"
          element={<Migration />}
        />

        {/* PUBLIC FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    );
  }

  // ====================================================
  // SIDEBAR / MAIN CONTENT
  // ====================================================

  const mainStyle = isRTL
    ? {
        marginRight: 292,
        width: 'calc(100% - 292px)',
      }
    : {
        marginLeft: 292,
        width: 'calc(100% - 292px)',
      };

  // ====================================================
  // AUTHENTICATED APP
  // ====================================================

  return (
    <div
      className="
        flex
        min-h-screen
        bg-gray-50
        relative
        text-gray-900
        font-sans
        overflow-hidden
      "
    >

      {/* ==================================================
          BACKGROUND ORBS
      ================================================== */}

      <div className="orb-container">

        <div className="orb orb-1" />

        <div className="orb orb-2" />

      </div>

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        onLogout={logout}
        user={user}
      />

      {/* ==================================================
          NOTIFICATIONS
      ================================================== */}

      <NotificationCenter
        user={user}
      />

      {/* ==================================================
          AI AGENT
      ================================================== */}

      <AIAgent />

      {/* ==================================================
          MAIN
      ================================================== */}

      <div
        className="
          flex-1
          flex
          flex-col
          relative
          z-0
        "
        style={mainStyle}
      >

        <div
          className="
            flex-1
            overflow-y-auto
          "
        >

          <AnimatePresence
            mode="wait"
          >

            <Routes
              location={location}
              key={location.pathname}
            >

              {/* ========================================
                  DASHBOARD
              ======================================== */}

              <Route
                path="/"
                element={
                  <PrivateRoute
                    roles={['admin']}
                  >
                    <PageTransition>
                      <Dashboard
                        user={user}
                      />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  MANAGER
              ======================================== */}

              <Route
                path="/manager"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Manager />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  INVENTORY
              ======================================== */}

              <Route
                path="/inventory"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'inventory',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Inventory
                        user={user}
                      />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  SALES
              ======================================== */}

              <Route
                path="/sales"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'cashier',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Sales />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  SALES HISTORY
              ======================================== */}

              <Route
                path="/sales/history"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'cashier',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <SalesHistory />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  REVENUE
              ======================================== */}

              <Route
                path="/revenue"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'finance',
                    ]}
                  >
                    <PageTransition>
                      <Revenue />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  HR
              ======================================== */}

              <Route
                path="/hr"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <HR />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  EMPLOYEES
              ======================================== */}

              <Route
                path="/employees"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Employees />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  ADD EMPLOYEE
              ======================================== */}

              <Route
                path="/employees/add"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <AddEmployee />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  EMPLOYEE PROFILE
              ======================================== */}

              <Route
                path="/employee/:id"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <EmployeeProfile />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  ATTENDANCE
              ======================================== */}

              <Route
                path="/attendance"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'cashier',
                      'hr',
                      'inventory',
                      'finance',
                      'staff',
                      'operations',
                      'pharmacist',
                      'expenses',
                    ]}
                  >
                    <PageTransition>
                      <Attendance />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  SHIFT AUDIT
              ======================================== */}

              <Route
                path="/shift-audit"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <ShiftAudit />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  ADMIN / HR LEAVES MANAGEMENT
              ======================================== */}

              <Route
                path="/leaves"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'cashier',
                      'hr',
                      'inventory',
                      'finance',
                      'staff',
                      'operations',
                      'pharmacist',
                      'expenses',
                    ]}
                  >
                    <PageTransition>
                      <Leaves />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  EMPLOYEE APPLY FOR LEAVE
              ======================================== */}


<Route
  path="/employee/apply-leave"
  element={
    <PrivateRoute
      roles={[
        'admin',
        'manager',
        'cashier',
        'hr',
        'inventory',
        'finance',
        'staff',
        'operations',
        'pharmacist',
        'expenses',
      ]}
    >
      <PageTransition>
        <EmployeeLeaveForm />
      </PageTransition>
    </PrivateRoute>
  }
/>
             

              {/* ========================================
                  PAYROLL
              ======================================== */}

              <Route
                path="/payroll"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <Payroll />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  PROJECT COSTING
              ======================================== */}

              <Route
                path="/project-costing"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                      'finance',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <ProjectCosting />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  LOANS
              ======================================== */}

              <Route
                path="/loans"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <Loans />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  BI DASHBOARD
              ======================================== */}

              <Route
                path="/bi-dashboard"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <BIDashboard />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  REPORTS
              ======================================== */}

              <Route
                path="/reports"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Reports />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  ALERTS
              ======================================== */}

              <Route
                path="/alerts"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <AlertCenter />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  OVERTIME
              ======================================== */}

              <Route
                path="/overtime"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'hr',
                    ]}
                  >
                    <PageTransition>
                      <Overtime />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  MIGRATION
              ======================================== */}

              <Route
                path="/migration"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                    ]}
                  >
                    <PageTransition>
                      <Migration />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  SUPPLIERS
              ======================================== */}

              <Route
                path="/suppliers"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'inventory',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Suppliers />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  CUSTOMERS
              ======================================== */}

              <Route
                path="/customers"
                element={
                  <PrivateRoute>
                    <PageTransition>
                      <Customers />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  EXPENSES
              ======================================== */}

              <Route
                path="/expenses"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'expenses',
                    ]}
                  >
                    <PageTransition>
                      <Expenses />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  USERS
              ======================================== */}

              <Route
                path="/users"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                    ]}
                  >
                    <PageTransition>
                      <Users />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  EOD
              ======================================== */}

              <Route
                path="/eod"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'cashier',
                      'operations',
                    ]}
                  >
                    <PageTransition>
                      <EODReport />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  DELIVERY
              ======================================== */}

              <Route
                path="/delivery"
                element={
                  <PrivateRoute
                    roles={[
                      'admin',
                      'manager',
                      'operations',
                    ]}
                  >
                    <PageTransition>
                      <Delivery />
                    </PageTransition>
                  </PrivateRoute>
                }
              />

              {/* ========================================
                  FALLBACK
              ======================================== */}

              <Route
                path="*"
                element={
                  <Navigate
                    to={getDefaultRoute(user?.role)}
                    replace
                  />
                }
              />

            </Routes>

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// MAIN APP
// ======================================================

function App() {
  return (
    <LanguageProvider>

      <AuthProvider>

        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >

          <AppContent />

        </Router>

      </AuthProvider>

    </LanguageProvider>
  );
}

export default App;