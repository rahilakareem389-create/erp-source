import React, { useState, useEffect } from 'react';
import { employeeAPI, advanceAPI, leaveAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, Printer, Download, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Payroll = () => {
  const { t, isRTL } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [status, setStatus] = useState('Draft'); // Draft, Review, Approved, Paid
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    Promise.all([
      employeeAPI.getAll(),
      advanceAPI.getAll()
    ]).then(([empRes, loanRes]) => {
      setEmployees(empRes.data);
      setLoans(loanRes.data || []);
    }).catch(console.error);
  }, []);

  const calculatePayroll = (emp) => {
    const s = emp.salaryStructure || {};
    const basic = s.basicSalary || 0;
    const allowances = (s.housingAllowance || 0) + (s.transportationAllowance || 0) + (s.foodAllowance || 0) + (s.siteAllowance || 0) + (s.mobileAllowance || 0);
    
    // Mock Deductions
    const activeLoan = loans.find(l => l.employeeId === emp.id && l.status === 'Active');
    const loanDeduction = activeLoan ? (activeLoan.amount / activeLoan.installments) : 0;
    
    const gross = basic + allowances;
    const deductions = loanDeduction;
    const net = gross - deductions;

    return { basic, allowances, gross, loanDeduction, deductions, net };
  };

  const handleApprove = () => {
    if (status === 'Draft') setStatus('Review');
    else if (status === 'Review') setStatus('Approved');
    else if (status === 'Approved') setStatus('Paid');
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + calculatePayroll(emp).net, 0);

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{t('payroll')} Processing</h1>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Manage monthly salaries, allowances, and deductions.</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, outline: 'none' }} />
          <button onClick={handleApprove} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: status === 'Paid' ? '#10b981' : '#0a84ff', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {status === 'Paid' ? <CheckCircle size={18} /> : <Clock size={18} />} 
            {status === 'Draft' ? 'Submit for Review' : status === 'Review' ? 'Approve Payroll' : status === 'Approved' ? 'Mark as Paid' : 'Payroll Closed'}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'white', padding: 16, borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
        {['Draft', 'Review', 'Approved', 'Paid'].map((step, idx) => {
          const statuses = ['Draft', 'Review', 'Approved', 'Paid'];
          const currentIndex = statuses.indexOf(status);
          const isCompleted = idx <= currentIndex;
          return (
            <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, opacity: isCompleted ? 1 : 0.4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: isCompleted ? '#0a84ff' : '#f1f5f9', color: isCompleted ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {idx + 1}
              </div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{step}</div>
              {idx < 3 && <div style={{ flex: 1, height: 2, background: isCompleted ? '#0a84ff' : '#f1f5f9', opacity: 0.5 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Payroll Table */}
        <div style={{ background: 'white', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: 24, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Salary Breakdown</h2>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0a84ff', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
              Total: SAR {totalPayroll.toLocaleString()}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Basic</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Allowances</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Deductions</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#64748b' }}>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const pay = calculatePayroll(emp);
                return (
                  <tr key={emp.id} onClick={() => setSelectedEmployee(emp)} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', background: selectedEmployee?.id === emp.id ? '#eff6ff' : 'transparent' }} onMouseOver={e => e.currentTarget.style.background = selectedEmployee?.id === emp.id ? '#eff6ff' : '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = selectedEmployee?.id === emp.id ? '#eff6ff' : 'transparent'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{isRTL ? emp.arabicName : emp.englishName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{emp.id}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#475569', fontSize: 14 }}>{pay.basic}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#16a34a', fontSize: 14 }}>+{pay.allowances}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#dc2626', fontSize: 14 }}>-{pay.deductions.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a', fontSize: 15 }}>SAR {pay.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Payslip Preview */}
        <div>
          <AnimatePresence mode="wait">
            {selectedEmployee ? (
              <motion.div key={selectedEmployee.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'white', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '2px dashed rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Concrete Structures</h3>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginTop: 4 }}>Payslip for {selectedMonth}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, fontSize: 13, fontWeight: 700, color: '#475569' }}>
                  <div>Name:<br/><span style={{ color: '#0f172a', fontSize: 15, fontWeight: 900 }}>{isRTL ? selectedEmployee.arabicName : selectedEmployee.englishName}</span></div>
                  <div>ID:<br/><span style={{ color: '#0f172a', fontSize: 15, fontWeight: 900 }}>{selectedEmployee.id}</span></div>
                  <div>Dept:<br/><span style={{ color: '#0f172a' }}>{selectedEmployee.department}</span></div>
                  <div>Project:<br/><span style={{ color: '#0f172a' }}>{selectedEmployee.siteProject || 'HQ'}</span></div>
                </div>

                {(() => {
                  const pay = calculatePayroll(selectedEmployee);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                        <span>Basic Salary</span>
                        <span>{pay.basic.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                        <span>Housing Allowance</span>
                        <span>{selectedEmployee.salaryStructure?.housingAllowance?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#475569' }}>
                        <span>Transport Allowance</span>
                        <span>{selectedEmployee.salaryStructure?.transportationAllowance?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
                        <span>Loan Deduction</span>
                        <span>-{pay.loanDeduction.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>Net Pay</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>SAR {pay.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    <Printer size={16} /> Print
                  </button>
                  <button style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                    <Download size={16} /> PDF
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={{ background: 'white', borderRadius: 24, border: '1px dashed rgba(0,0,0,0.2)', padding: 60, textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                Select an employee to preview payslip.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
