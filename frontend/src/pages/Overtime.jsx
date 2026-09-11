import React, { useState, useEffect } from 'react';
import { overtimeAPI, employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const Overtime = () => {
  const { t, isRTL } = useLanguage();
  const [overtimeReqs, setOvertimeReqs] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    Promise.all([
      overtimeAPI.getPending(),
      employeeAPI.getAll()
    ]).then(([otRes, empRes]) => {
      setOvertimeReqs(otRes.data || []);
      setEmployees(empRes.data || []);
    }).catch(console.error);
  }, []);

  const getEmpName = (id) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return id;
    return isRTL ? emp.arabicName : emp.englishName;
  };
  
  const handleApprove = async (id) => {
    await overtimeAPI.approve(id);
    setOvertimeReqs(prev => prev.filter(r => r.id !== id));
  };
  
  const handleReject = async (id) => {
    await overtimeAPI.reject(id);
    setOvertimeReqs(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Clock color="var(--theme-primary)" /> Overtime Timesheets
        </h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Review and approve extra hours generated from site attendance.</p>
      </header>

      <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-body)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Employee</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Project Site</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Hours & Rate</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overtimeReqs.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{getEmpName(req.employeeId)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{req.employeeId}</div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>{req.projectId}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>{req.date}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 900, color: 'var(--theme-primary)', fontSize: 16 }}>{req.hours} hours</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>Type: {req.type} (x{req.rate})</div>
                </td>
                <td style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
                  <button onClick={() => handleApprove(req.id)} style={{ padding: '8px 12px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(req.id)} style={{ padding: '8px 12px', borderRadius: 8, background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={14} /> Reject
                  </button>
                </td>
              </tr>
            ))}
            {overtimeReqs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>
                  No pending overtime timesheets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overtime;
