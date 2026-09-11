import React, { useState, useEffect } from 'react';
import { advanceAPI, employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

const Loans = () => {
  const { t, isRTL } = useLanguage();
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    Promise.all([
      advanceAPI.getAll(),
      employeeAPI.getAll()
    ]).then(([loansRes, empsRes]) => {
      setLoans(loansRes.data || []);
      setEmployees(empsRes.data || []);
    }).catch(console.error);
  }, []);

  const getEmpName = (id) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return id;
    return isRTL ? emp.arabicName : emp.englishName;
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)' }}>{t('loans')} & Advances</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage employee loans and automated payroll deductions.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {loans.map(loan => {
          const installment = loan.amount / loan.installments;
          const remaining = loan.amount - loan.paidAmount;
          const percentPaid = (loan.paidAmount / loan.amount) * 100;

          return (
            <div key={loan.id} style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 32, border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{getEmpName(loan.employeeId)}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>{loan.employeeId}</div>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 8, background: loan.status === 'Active' ? '#eff6ff' : '#f0fdf4', color: loan.status === 'Active' ? 'var(--theme-primary)' : '#16a34a', fontWeight: 800, fontSize: 12 }}>
                  {loan.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Total Loan</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>SAR {loan.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly Ded.</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444' }}>SAR {installment.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Repayment Progress</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>{percentPaid.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentPaid}%`, background: '#10b981', borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 8 }}>
                  <span>Paid: SAR {loan.paidAmount.toLocaleString()}</span>
                  <span>Remaining: SAR {remaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Loans;
