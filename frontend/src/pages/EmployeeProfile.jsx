import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, User, Briefcase, FileText, DollarSign, AlertTriangle, ShieldAlert, History } from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    employeeAPI.getById(id).then(res => setEmployee(res.data)).catch(console.error);
  }, [id]);

  if (!employee) return <div className="p-10">Loading Profile...</div>;

  const TabButton = ({ id: tabId, label, icon }) => (
    <button onClick={() => setActiveTab(tabId)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none',
        background: activeTab === tabId ? '#0f172a' : 'transparent',
        color: activeTab === tabId ? 'white' : '#64748b',
        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
      }}>
      {icon} {label}
    </button>
  );

  const Field = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{value || '-'}</span>
    </div>
  );

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <button onClick={() => navigate('/employees')} 
        style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
        <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} /> Back to Employees
      </button>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Profile Card */}
        <div style={{ width: 320, background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: 50, background: '#0a84ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, margin: '0 auto 20px' }}>
            {employee.englishName.charAt(0)}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>{isRTL ? employee.arabicName : employee.englishName}</h2>
          <div style={{ color: '#64748b', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{employee.jobTitle} • {employee.department}</div>
          <div style={{ marginTop: 16, display: 'inline-block', padding: '6px 12px', borderRadius: 8, background: employee.employeeStatus === 'Active' ? '#dcfce7' : '#fee2e2', color: employee.employeeStatus === 'Active' ? '#16a34a' : '#dc2626', fontWeight: 800, fontSize: 12 }}>
            {employee.employeeStatus}
          </div>
        </div>

        {/* Details Area */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 8, borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
            <TabButton id="personal" label="Personal" icon={<User size={18} />} />
            <TabButton id="employment" label="Employment" icon={<Briefcase size={18} />} />
            <TabButton id="salary" label="Salary" icon={<DollarSign size={18} />} />
            <TabButton id="documents" label="Documents" icon={<FileText size={18} />} />
            <TabButton id="eos" label="End of Service" icon={<ShieldAlert size={18} />} />
            <TabButton id="history" label="History" icon={<History size={18} />} />
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
            
            {activeTab === 'personal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <Field label="English Name" value={employee.englishName} />
                <Field label="Arabic Name" value={employee.arabicName} />
                <Field label="Employee ID" value={employee.id} />
                <Field label="Nationality" value={employee.nationality} />
                <Field label="National ID / Iqama" value={employee.nationalId} />
                <Field label="Passport" value={employee.passport} />
                <Field label="Mobile" value={employee.mobile} />
                <Field label="Email" value={employee.email} />
              </div>
            )}

            {activeTab === 'employment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <Field label="Department" value={employee.department} />
                <Field label="Job Title" value={employee.jobTitle} />
                <Field label="Project / Site" value={employee.siteProject} />
                <Field label="Joining Date" value={employee.joiningDate} />
                <Field label="Contract Start" value={employee.contractStartDate} />
                <Field label="Contract Expiry" value={employee.contractExpiryDate} />
              </div>
            )}

            {activeTab === 'salary' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <Field label="Basic Salary" value={`SAR ${employee.salaryStructure?.basicSalary}`} />
                <Field label="Housing Allowance" value={`SAR ${employee.salaryStructure?.housingAllowance}`} />
                <Field label="Transportation" value={`SAR ${employee.salaryStructure?.transportationAllowance}`} />
                <Field label="Food Allowance" value={`SAR ${employee.salaryStructure?.foodAllowance}`} />
                <Field label="Site Allowance" value={`SAR ${employee.salaryStructure?.siteAllowance}`} />
                <Field label="Normal Overtime Rate" value={`${employee.salaryStructure?.normalOvertimeRate}x`} />
              </div>
            )}

            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {employee.documents?.map((doc, idx) => {
                  const expDate = new Date(doc.expiryDate);
                  const isExpiring = (expDate - new Date()) / (1000 * 60 * 60 * 24) < 90;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', background: isExpiring ? '#fef2f2' : '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileText size={24} color={isExpiring ? '#ef4444' : '#64748b'} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{doc.type}</div>
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Issued: {doc.issueDate}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: isExpiring ? '#ef4444' : '#0f172a' }}>Exp: {doc.expiryDate}</div>
                        {isExpiring && <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><AlertTriangle size={12}/> Needs Renewal</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'eos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Estimated Indemnity (Saudi Labor Law)</h3>
                  
                  {(() => {
                    const joinDate = new Date(employee.joiningDate);
                    const now = new Date();
                    const years = (now - joinDate) / (1000 * 60 * 60 * 24 * 365.25);
                    const basic = employee.salaryStructure?.basicSalary || 0;
                    const allowance = employee.salaryStructure?.housingAllowance || 0;
                    const totalSalary = basic + allowance;
                    
                    let indemnity = 0;
                    if (years <= 5) {
                      indemnity = (totalSalary / 2) * years;
                    } else {
                      indemnity = ((totalSalary / 2) * 5) + (totalSalary * (years - 5));
                    }

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <Field label="Years of Service" value={`${years.toFixed(1)} Years`} />
                        <Field label="Last Total Salary" value={`SAR ${totalSalary.toLocaleString()}`} />
                        <div style={{ gridColumn: '1 / -1', background: '#eff6ff', padding: 20, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#0a84ff' }}>Total Estimated Accrual</span>
                          <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>SAR {indemnity.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {employee.history?.length ? (
                  employee.history.map((hist, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', background: '#f8fafc' }}>
                      <div style={{ padding: '8px 12px', background: 'white', borderRadius: 8, fontWeight: 800, color: '#64748b', fontSize: 12, height: 'fit-content' }}>
                        {hist.date}
                      </div>
                      <div style={{ flex: 1, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
                        {hist.event}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>No historical records found.</div>
                )}
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
