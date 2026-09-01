import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Download, Printer, Filter } from 'lucide-react';

const Reports = () => {
  const { t, isRTL } = useLanguage();
  const [selectedReport, setSelectedReport] = useState('');

  const reportsList = [
    { id: 'emp_list', name: 'Employee List (Master Data)' },
    { id: 'emp_dept', name: 'Employees by Department' },
    { id: 'emp_proj', name: 'Employees by Project' },
    { id: 'emp_nat', name: 'Employees by Nationality' },
    { id: 'salary', name: 'Salary Report' },
    { id: 'payroll', name: 'Payroll Processing Report' },
    { id: 'allowance', name: 'Allowance Report' },
    { id: 'deduction', name: 'Deduction Report' },
    { id: 'overtime', name: 'Overtime Report' },
    { id: 'loan', name: 'Loan & Advance Report' },
    { id: 'leave', name: 'Leave Report' },
    { id: 'attendance', name: 'Attendance Report' },
    { id: 'expiry', name: 'Document Expiry Report' },
    { id: 'eos', name: 'End-of-Service Liability Report' },
    { id: 'cost', name: 'Employee Costing by Project' }
  ];

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{t('reports')} Center</h1>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Generate, filter, and export comprehensive HR & Payroll reports.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
        {/* Report Selection */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Available Reports</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '60vh', overflowY: 'auto', paddingRight: 8 }}>
            {reportsList.map(r => (
              <button 
                key={r.id} 
                onClick={() => setSelectedReport(r.id)}
                style={{
                  padding: '16px 20px', borderRadius: 12, border: 'none', textAlign: isRTL ? 'right' : 'left',
                  background: selectedReport === r.id ? '#eff6ff' : 'transparent',
                  color: selectedReport === r.id ? '#0a84ff' : '#475569',
                  fontWeight: selectedReport === r.id ? 800 : 600,
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12
                }}
              >
                <FileText size={18} /> {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Report Configuration */}
        <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid rgba(0,0,0,0.05)' }}>
          {selectedReport ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {reportsList.find(r => r.id === selectedReport)?.name}
                </h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ padding: '10px 16px', borderRadius: 12, background: '#f1f5f9', color: '#0f172a', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Filter size={16} /> Filters
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Company/Branch</label>
                  <select style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontWeight: 600 }}>
                    <option>All Branches</option>
                    <option>Riyadh HQ</option>
                    <option>Jeddah Branch</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Project</label>
                  <select style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontWeight: 600 }}>
                    <option>All Projects</option>
                    <option>Project Alpha</option>
                    <option>Project Beta</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Date Range</label>
                  <input type="month" style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontWeight: 600 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#0a84ff', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Preview Report
                </button>
                <button style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Download size={18} /> Export Excel
                </button>
                <button style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Printer size={18} /> Print PDF
                </button>
              </div>

              {/* Mock Preview Area */}
              <div style={{ marginTop: 40, padding: 40, border: '2px dashed rgba(0,0,0,0.1)', borderRadius: 24, textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>
                Select filters and click "Preview Report" to render data table here.
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 700 }}>
              Select a report from the left sidebar to configure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
