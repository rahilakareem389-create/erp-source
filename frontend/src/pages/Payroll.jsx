import React, { useState, useEffect } from 'react';
import { employeeAPI, advanceAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Printer, Download, CheckCircle, Clock } from 'lucide-react';
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

  // Print the currently selected employee's payslip.
  const handlePrint = () => {
    if (!selectedEmployee) {
      window.alert('Please select an employee first.');
      return;
    }

    const pay = calculatePayroll(selectedEmployee);
    const employeeName = isRTL
      ? (selectedEmployee.arabicName || selectedEmployee.englishName || 'Employee')
      : (selectedEmployee.englishName || selectedEmployee.arabicName || 'Employee');

    const popup = window.open('', '_blank', 'width=900,height=800');

    if (!popup) {
      window.alert('Please allow pop-ups in your browser to print the payslip.');
      return;
    }

    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employeeName}</title>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #fff;
          }
          .payslip {
            max-width: 760px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
          }
          .header {
            text-align: center;
            padding-bottom: 22px;
            border-bottom: 2px dashed #cbd5e1;
          }
          h1 { margin: 0; font-size: 24px; }
          .muted { color: #64748b; margin-top: 6px; }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin: 28px 0;
          }
          .label { color: #64748b; font-size: 12px; font-weight: bold; }
          .value { margin-top: 5px; font-size: 15px; font-weight: bold; }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .net {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 2px solid #0f172a;
            font-size: 19px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .payslip { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <h1>Concrete Structures</h1>
            <div class="muted">Payslip for ${selectedMonth}</div>
          </div>

          <div class="info">
            <div>
              <div class="label">Name</div>
              <div class="value">${employeeName}</div>
            </div>
            <div>
              <div class="label">Employee ID</div>
              <div class="value">${selectedEmployee.id || '-'}</div>
            </div>
            <div>
              <div class="label">Department</div>
              <div class="value">${selectedEmployee.department || '-'}</div>
            </div>
            <div>
              <div class="label">Project</div>
              <div class="value">${selectedEmployee.siteProject || 'HQ'}</div>
            </div>
          </div>

          <div class="row">
            <span>Basic Salary</span>
            <strong>SAR ${pay.basic.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Allowances</span>
            <strong>SAR ${pay.allowances.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Gross Salary</span>
            <strong>SAR ${pay.gross.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Loan Deduction</span>
            <strong>SAR -${pay.loanDeduction.toFixed(2)}</strong>
          </div>

          <div class="net">
            <span>Net Pay</span>
            <span>SAR ${pay.net.toFixed(2)}</span>
          </div>

          <div class="footer">Generated from Payroll Management System</div>
        </div>
      </body>
      </html>
    `);

    popup.document.close();
    popup.focus();

    // Wait for the print document to render before opening the print dialog.
    setTimeout(() => {
      popup.print();
    }, 300);
  };

  // Download the selected payslip as a PDF using the browser's print-to-PDF
  // dialog. This avoids requiring an additional PDF library/package.
  const handleDownloadPDF = () => {
    if (!selectedEmployee) {
      window.alert('Please select an employee first.');
      return;
    }

    const pay = calculatePayroll(selectedEmployee);
    const employeeName = isRTL
      ? (selectedEmployee.arabicName || selectedEmployee.englishName || 'Employee')
      : (selectedEmployee.englishName || selectedEmployee.arabicName || 'Employee');

    const popup = window.open('', '_blank', 'width=900,height=800');

    if (!popup) {
      window.alert('Please allow pop-ups in your browser to download the PDF.');
      return;
    }

    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${employeeName} - ${selectedMonth}</title>
        <meta charset="UTF-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #fff;
          }
          .payslip {
            max-width: 760px;
            margin: 0 auto;
            padding: 32px;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
          }
          .header {
            text-align: center;
            padding-bottom: 22px;
            border-bottom: 2px dashed #cbd5e1;
          }
          h1 { margin: 0; font-size: 24px; }
          .muted { color: #64748b; margin-top: 6px; }
          .info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin: 28px 0;
          }
          .label { color: #64748b; font-size: 12px; font-weight: bold; }
          .value { margin-top: 5px; font-size: 15px; font-weight: bold; }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .net {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 2px solid #0f172a;
            font-size: 19px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .payslip { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <h1>Concrete Structures</h1>
            <div class="muted">Payslip for ${selectedMonth}</div>
          </div>

          <div class="info">
            <div>
              <div class="label">Name</div>
              <div class="value">${employeeName}</div>
            </div>
            <div>
              <div class="label">Employee ID</div>
              <div class="value">${selectedEmployee.id || '-'}</div>
            </div>
            <div>
              <div class="label">Department</div>
              <div class="value">${selectedEmployee.department || '-'}</div>
            </div>
            <div>
              <div class="label">Project</div>
              <div class="value">${selectedEmployee.siteProject || 'HQ'}</div>
            </div>
          </div>

          <div class="row">
            <span>Basic Salary</span>
            <strong>SAR ${pay.basic.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Allowances</span>
            <strong>SAR ${pay.allowances.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Gross Salary</span>
            <strong>SAR ${pay.gross.toFixed(2)}</strong>
          </div>
          <div class="row">
            <span>Loan Deduction</span>
            <strong>SAR -${pay.loanDeduction.toFixed(2)}</strong>
          </div>

          <div class="net">
            <span>Net Pay</span>
            <span>SAR ${pay.net.toFixed(2)}</span>
          </div>

          <div class="footer">Use your browser's Save as PDF option in the print dialog.</div>
        </div>
      </body>
      </html>
    `);

    popup.document.close();
    popup.focus();

    setTimeout(() => {
      popup.print();
    }, 300);
  };

  const handleApprove = () => {
    if (status === 'Draft') setStatus('Review');
    else if (status === 'Review') setStatus('Approved');
    else if (status === 'Approved') setStatus('Paid');
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + calculatePayroll(emp).net, 0);

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)' }}>{t('payroll')} Processing</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage monthly salaries, allowances, and deductions.</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, outline: 'none' }} />
          <button onClick={handleApprove} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: status === 'Paid' ? '#10b981' : 'var(--theme-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
            {status === 'Paid' ? <CheckCircle size={18} /> : <Clock size={18} />} 
            {status === 'Draft' ? 'Submit for Review' : status === 'Review' ? 'Approve Payroll' : status === 'Approved' ? 'Mark as Paid' : 'Payroll Closed'}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'var(--bg-surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border-main)' }}>
        {['Draft', 'Review', 'Approved', 'Paid'].map((step, idx) => {
          const statuses = ['Draft', 'Review', 'Approved', 'Paid'];
          const currentIndex = statuses.indexOf(status);
          const isCompleted = idx <= currentIndex;
          return (
            <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, opacity: isCompleted ? 1 : 0.4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: isCompleted ? 'var(--theme-primary)' : '#f1f5f9', color: isCompleted ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {idx + 1}
              </div>
              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{step}</div>
              {idx < 3 && <div style={{ flex: 1, height: 2, background: isCompleted ? 'var(--theme-primary)' : '#f1f5f9', opacity: 0.5 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Payroll Table */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border-main)', overflow: 'hidden' }}>
          <div style={{ padding: 24, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Salary Breakdown</h2>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--theme-primary)', background: '#eff6ff', padding: '6px 12px', borderRadius: 8 }}>
              Total: SAR {totalPayroll.toLocaleString()}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Basic</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Allowances</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Deductions</th>
                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const pay = calculatePayroll(emp);
                return (
                  <tr key={emp.id} onClick={() => setSelectedEmployee(emp)} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', background: selectedEmployee?.id === emp.id ? '#eff6ff' : 'transparent' }} onMouseOver={e => e.currentTarget.style.background = selectedEmployee?.id === emp.id ? '#eff6ff' : '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = selectedEmployee?.id === emp.id ? '#eff6ff' : 'transparent'}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{isRTL ? emp.arabicName : emp.englishName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{emp.id}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-main)', fontSize: 14 }}>{pay.basic}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#16a34a', fontSize: 14 }}>+{pay.allowances}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#dc2626', fontSize: 14 }}>-{pay.deductions.toFixed(2)}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)', fontSize: 15 }}>SAR {pay.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
                style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border-main)', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '2px dashed rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Concrete Structures</h3>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>Payslip for {selectedMonth}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  <div>Name:<br/><span style={{ color: 'var(--text-main)', fontSize: 15, fontWeight: 900 }}>{isRTL ? selectedEmployee.arabicName : selectedEmployee.englishName}</span></div>
                  <div>ID:<br/><span style={{ color: 'var(--text-main)', fontSize: 15, fontWeight: 900 }}>{selectedEmployee.id}</span></div>
                  <div>Dept:<br/><span style={{ color: 'var(--text-main)' }}>{selectedEmployee.department}</span></div>
                  <div>Project:<br/><span style={{ color: 'var(--text-main)' }}>{selectedEmployee.siteProject || 'HQ'}</span></div>
                </div>

                {(() => {
                  const pay = calculatePayroll(selectedEmployee);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                        <span>Basic Salary</span>
                        <span>{pay.basic.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                        <span>Housing Allowance</span>
                        <span>{selectedEmployee.salaryStructure?.housingAllowance?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                        <span>Transport Allowance</span>
                        <span>{selectedEmployee.salaryStructure?.transportationAllowance?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
                        <span>Loan Deduction</span>
                        <span>-{pay.loanDeduction.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)' }}>Net Pay</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>SAR {pay.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button
                    type="button"
                    onClick={handlePrint}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-surface)', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                  >
                    <Printer size={16} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: '#0f172a', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                  >
                    <Download size={16} /> PDF
                  </button>
                </div>
              </motion.div>
            ) : (
              <div style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px dashed rgba(0,0,0,0.2)', padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700 }}>
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
