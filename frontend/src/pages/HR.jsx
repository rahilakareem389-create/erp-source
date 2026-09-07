import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Clock, AlertCircle, ChevronRight, Activity, Globe, FileText, Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { hrAPI, employeeAPI, attendanceAPI, leaveAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';

const HR = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, empRes] = await Promise.all([
          hrAPI.getStats(),
          employeeAPI.getAll()
        ]);
        setStats(statRes.data);
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  const activeEmployees = employees.filter(e => e.employeeStatus === 'Active');
  const saudi = activeEmployees.filter(e => e.nationality === 'Saudi').length;
  const nonSaudi = activeEmployees.length - saudi;
  
  // Expiry alerts (mock logic for demo)
  const expiringDocs = employees.filter(e => 
    e.documents?.some(d => {
      const expDate = new Date(d.expiryDate);
      const diffDays = (expDate - new Date()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays < 90;
    })
  ).length;

  const StatBox = ({ title, value, icon, color, subtitle, onClick }) => (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      style={{ background: 'white', padding: 24, borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 20, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {onClick && <ChevronRight size={16} color="#94a3b8" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />}
    </motion.div>
  );

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{t('hrCenter')} Dashboard</h1>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Overview of headcount, payroll, and compliance.</p>
        </div>
        <button onClick={() => navigate('/employees')} 
          style={{ padding: '12px 20px', borderRadius: 14, background: '#0a84ff', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
          {t('addEmployee')}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
        <StatBox title={t('totalStaff')} value={employees.length} icon={<Users size={24} />} color="#0a84ff"
          subtitle={`${activeEmployees.length} ${t('active')}`} onClick={() => navigate('/employees')} />
          
        <StatBox title="Nationality Mix" value={`${saudi} / ${nonSaudi}`} icon={<Globe size={24} />} color="#10b981"
          subtitle={`${t('saudi')} / ${t('nonSaudi')}`} />
          
        <StatBox title="Expiring Docs" value={expiringDocs} icon={<AlertCircle size={24} />} color="#f59e0b"
          subtitle="< 90 Days" onClick={() => navigate('/employees')} />
          
        <StatBox title={t('estPayroll')} value={`SAR ${stats?.estPayroll.toLocaleString()}`} icon={<DollarSign size={24} />} color="#a855f7"
          subtitle="This Month" onClick={() => navigate('/payroll')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* Department Breakdown */}
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 24 }}>Employees by Department</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Engineering', 'HR', 'Finance', 'Operations'].map(dept => {
              const count = employees.filter(e => e.department === dept).length;
              if (count === 0) return null;
              const max = employees.length;
              return (
                <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 100, fontSize: 13, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>{dept}</div>
                  <div style={{ flex: 1, height: 32, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: 'linear-gradient(90deg, #0a84ff, #6366f1)', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', minWidth: 36 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#0f172a', borderRadius: 24, padding: 32, color: 'white' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Action Center</h3>
            <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 24, fontWeight: 500 }}>Review pending approvals and requests.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.div whileHover={{ x: isRTL ? -4 : 4 }} onClick={() => navigate('/leaves')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                <Clock size={16} color="#60a5fa" />
                <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{stats?.pendingLeaves || 0} {t('pendingLeaves')}</div>
                <ChevronRight size={14} color="#94a3b8" style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HR;
