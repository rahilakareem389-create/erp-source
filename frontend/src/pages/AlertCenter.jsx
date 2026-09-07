import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const AlertCenter = () => {
  const { t, isRTL } = useLanguage();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    employeeAPI.getAll().then(res => setEmployees(res.data)).catch(console.error);
  }, []);

  const getStatus = (expiryDate) => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: '#ef4444', bg: '#fee2e2', text: 'Expired', days: diffDays };
    if (diffDays <= 90) return { color: '#f59e0b', bg: '#fef3c7', text: 'Expiring Soon', days: diffDays };
    return { color: '#10b981', bg: '#dcfce7', text: 'Valid', days: diffDays };
  };

  const getExpiringDocs = () => {
    let docs = [];
    employees.forEach(emp => {
      // Check Contract
      const contractStatus = getStatus(emp.contractExpiryDate);
      if (contractStatus.days <= 90) {
        docs.push({ empId: emp.id, name: isRTL ? emp.arabicName : emp.englishName, type: 'Employment Contract', expiry: emp.contractExpiryDate, status: contractStatus });
      }
      // Check specific docs
      (emp.documents || []).forEach(doc => {
        const docStatus = getStatus(doc.expiryDate);
        if (docStatus.days <= 90) {
          docs.push({ empId: emp.id, name: isRTL ? emp.arabicName : emp.englishName, type: doc.type, expiry: doc.expiryDate, status: docStatus });
        }
      });
    });
    return docs.sort((a, b) => a.status.days - b.status.days);
  };

  const alerts = getExpiringDocs();

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle color="#ef4444" /> Document Expiry Alerts
        </h1>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Track Iqama, Passport, and Contract expirations (90, 60, 30, 7 days).</p>
      </header>

      <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Employee</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Document Type</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Expiry Date</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{alert.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{alert.empId}</div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 14 }}>{alert.type}</td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0f172a' }}>{alert.expiry}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: 8, background: alert.status.bg, color: alert.status.color, fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {alert.status.days < 0 ? <AlertTriangle size={14} /> : <Clock size={14} />}
                    {alert.status.days < 0 ? 'Expired' : `Expires in ${alert.status.days} days`}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>
                    Update Document
                  </button>
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#10b981', fontWeight: 800, fontSize: 16 }}>
                  <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <br />All documents are valid. No expirations within 90 days!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertCenter;
