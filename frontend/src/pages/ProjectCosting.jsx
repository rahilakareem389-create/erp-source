import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Package, TrendingUp, Users, DollarSign, Filter } from 'lucide-react';

const ProjectCosting = () => {
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

  const getProjectStats = (projName) => {
    const projEmps = employees.filter(e => e.siteProject === projName);
    const laborCost = projEmps.reduce((sum, emp) => {
      const s = emp.salaryStructure || {};
      return sum + (s.basicSalary || 0) + (s.housingAllowance || 0) + (s.transportationAllowance || 0) + (s.foodAllowance || 0) + (s.siteAllowance || 0) + (s.mobileAllowance || 0);
    }, 0);
    return { headCount: projEmps.length, laborCost };
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)' }}>{t('projectCosting')}</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Track labor allocation and costs against project budgets.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, cursor: 'pointer' }}>
          <Filter size={18} /> Filters
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
        {projects.map((proj) => {
          const stats = getProjectStats(proj.name);
          const percentUsed = (stats.laborCost / proj.budget) * 100;
          return (
            <div key={proj.id} style={{ background: 'var(--bg-surface)', borderRadius: 24, border: '1px solid var(--border-main)', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{proj.name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700 }}>ID: {proj.id}</div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#eff6ff', color: 'var(--theme-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14}/> Headcount</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>{stats.headCount}</div>
                </div>
                <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14}/> Monthly Labor Cost</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>SAR {stats.laborCost.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Budget vs Labor Cost</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: percentUsed > 80 ? '#dc2626' : '#10b981' }}>{percentUsed.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(percentUsed, 100)}%`, background: percentUsed > 80 ? '#dc2626' : '#10b981', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>
                  Total Budget: SAR {proj.budget.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectCosting;
