import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Briefcase, LogOut, User, Zap, DollarSign, Shield, Clock, Calendar, Pill, Truck, TrendingDown, Navigation, PieChart, Languages, Bot, FileText, AlertTriangle, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { settingsAPI } from '../api';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t, isRTL, toggleLanguage } = useLanguage();
  const role = user?.role || 'admin';
  const [companyName, setCompanyName] = React.useState('Concrete Structures');

  React.useEffect(() => {
    settingsAPI.get().then(res => {
      if (res.data?.companyName) setCompanyName(res.data.companyName);
    }).catch(e => console.error(e));
  }, []);

  const menuItems = [
    { name: t('dashboard'),     icon: <LayoutDashboard size={18} />, path: '/',         roles: ['admin'] },
    { name: 'Manager Hub',   icon: <Shield size={18} />,          path: '/manager',   roles: ['admin', 'manager'] },
    { name: t('biDashboard'),icon: <PieChart size={18} />,        path: '/bi-dashboard',roles: ['admin', 'manager'] },
    
    // HR & Payroll
    { name: t('hrCenter'),   icon: <Shield size={18} />,           path: '/hr',        roles: ['admin', 'hr'] },
    { name: t('employees'),  icon: <Briefcase size={18} />,        path: '/employees', roles: ['admin', 'hr', 'manager'] },
    { name: t('attendance'), icon: <Clock size={18} />,            path: '/attendance', roles: ['admin', 'manager', 'cashier', 'hr', 'inventory', 'finance', 'staff', 'operations', 'pharmacist', 'expenses'] },
    { name: t('leaves'),     icon: <Calendar size={18} />,         path: '/leaves',    roles: ['admin', 'manager', 'cashier', 'hr', 'inventory', 'finance', 'staff', 'operations', 'pharmacist', 'expenses'] },
    { name: t('payroll'),    icon: <DollarSign size={18} />,       path: '/payroll',   roles: ['admin', 'hr'] },
    { name: 'Overtime',      icon: <Clock size={18} />,            path: '/overtime',  roles: ['admin', 'hr'] },
    { name: t('loans'),      icon: <DollarSign size={18} />,       path: '/loans',     roles: ['admin', 'hr'] },
    { name: t('projectCosting'),icon: <Package size={18} />,       path: '/project-costing', roles: ['admin', 'hr', 'finance', 'manager'] },
    { name: 'Reports',       icon: <FileText size={18} />,         path: '/reports',   roles: ['admin', 'hr', 'manager'] },
    { name: 'Alerts',        icon: <AlertTriangle size={18} />,    path: '/alerts',    roles: ['admin', 'hr'] },
    { name: 'Data Migration',icon: <Database size={18} />,         path: '/migration', roles: ['admin'] },
    
    // Others
    { name: 'Inventory',     icon: <Package size={18} />,          path: '/inventory', roles: ['admin', 'inventory', 'manager'] },
    { name: 'Sales POS',     icon: <ShoppingCart size={18} />,     path: '/sales',     roles: ['admin', 'cashier', 'manager'] },
    { name: 'Revenue',       icon: <DollarSign size={18} />,       path: '/revenue',   roles: ['admin', 'manager', 'finance'] },
    { name: 'Expenses',      icon: <TrendingDown size={18} />,     path: '/expenses',  roles: ['admin', 'manager', 'expenses', 'finance'] },
    { name: 'Customers',     icon: <Users size={18} />,            path: '/customers', roles: ['admin', 'cashier', 'manager'] },
  ];

  const filtered = menuItems.filter(i => i.roles.includes(role));

  const sidebarStyle = {
    width: 260, height: 'calc(100vh - 32px)',
    position: 'fixed', top: 16,
    zIndex: 50, borderRadius: 24,
    background: 'white',
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px',
    fontFamily: isRTL ? "'Tajawal', 'Cairo', sans-serif" : "'Outfit', sans-serif"
  };
  
  if (isRTL) {
    sidebarStyle.right = 16;
  } else {
    sidebarStyle.left = 16;
  }

  return (
    <div style={sidebarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '0 8px' }}>
        <motion.div whileHover={{ rotate: 360 }} style={{ width: 38, height: 38, borderRadius: 11, background: '#0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Zap size={18} fill="currentColor" />
        </motion.div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{companyName}</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>ERP v2.0</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: isRTL ? 0 : 4, paddingLeft: isRTL ? 4 : 0, scrollbarWidth: 'none' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(item => (
            <li key={item.name}>
              <NavLink to={item.path} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, textDecoration: 'none',
                fontWeight: 700, fontSize: 14, background: isActive ? 'rgba(10,132,255,0.08)' : 'transparent',
                color: isActive ? '#0a84ff' : '#64748b',
              })}>
                {item.icon} {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', background: '#f8fafc', color: '#0f172a', cursor: 'pointer', fontWeight: 800 }}>
          <Languages size={16} color="#0a84ff" /> {isRTL ? 'English' : 'عربي'}
        </button>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
