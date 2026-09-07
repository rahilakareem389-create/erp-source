import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { PieChart, TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';

const BIDashboard = () => {
  const { t, isRTL } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    Promise.all([
      employeeAPI.getProjects(),
      employeeAPI.getAll()
    ]).then(([projRes, empRes]) => {
      setProjects(projRes.data || []);
      setEmployees(empRes.data || []);
    }).catch(console.error);
  }, []);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalLaborCost = employees.reduce((sum, emp) => {
    const s = emp.salaryStructure || {};
    return sum + (s.basicSalary || 0) + (s.housingAllowance || 0) + (s.transportationAllowance || 0);
  }, 0);

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: '#f8fafc', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>{t('biDashboard')}</h1>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Executive insights on project profitability and labor costs.</p>
      </header>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#eff6ff', color: '#0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={24}/></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Total Project Value</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>SAR {(totalBudget * 1.5).toLocaleString()}</div>
        </div>
        
        <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24}/></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Monthly Labor Cost</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>SAR {totalLaborCost.toLocaleString()}</div>
        </div>
        
        <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={24}/></div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>Est. Margin</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a' }}>25.4%</div>
        </div>
      </div>

      {/* Project Breakdown Chart Mockup */}
      <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 32 }}>Project Profitability Analysis</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {projects.map(p => {
            const laborCost = employees.filter(e => e.siteProject === p.name).length * 15000; // Mock calculation
            const materialCost = p.budget * 0.4;
            const revenue = p.budget * 1.3;
            const profit = revenue - (laborCost + materialCost);
            const margin = (profit / revenue) * 100;
            
            return (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{p.name}</span>
                  <span style={{ fontWeight: 800, color: margin > 20 ? '#10b981' : '#f59e0b', fontSize: 15 }}>{margin.toFixed(1)}% Margin</span>
                </div>
                
                {/* Stacked Bar Mock */}
                <div style={{ width: '100%', height: 24, display: 'flex', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(laborCost / revenue) * 100}%`, background: '#0a84ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800 }} title="Labor Cost">L</div>
                  <div style={{ width: `${(materialCost / revenue) * 100}%`, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800 }} title="Material Cost">M</div>
                  <div style={{ width: `${(profit / revenue) * 100}%`, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 800 }} title="Profit">P</div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: '#0a84ff' }}/> Labor: SAR {laborCost.toLocaleString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: '#f59e0b' }}/> Material: SAR {materialCost.toLocaleString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 4, background: '#10b981' }}/> Profit: SAR {profit.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BIDashboard;
