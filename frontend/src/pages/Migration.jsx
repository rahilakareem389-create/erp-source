import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Upload, Database, CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';

const Migration = () => {
  const { t, isRTL } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | parsing | success

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadStatus('parsing');
    setTimeout(() => setUploadStatus('success'), 2000);
  };

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', direction: isRTL ? 'rtl' : 'ltr' }}>
      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)' }}>Legacy Data Migration</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 16 }}>Safely import your historical DOS database records via Excel/CSV templates.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, maxWidth: 1000, margin: '0 auto' }}>
        {/* Templates Section */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 40, border: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileSpreadsheet color="var(--theme-primary)" /> 1. Download Templates
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
            Export your old system data to these structured templates before uploading.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Employee Master Records', 'Historical Payroll Data', 'Active Loans & Balances', 'Leave Entitlements'].map((item, idx) => (
              <button key={idx} style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item} CSV
                <ArrowRight size={16} color="var(--theme-primary)" />
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 40, border: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Database color="#10b981" /> 2. Upload to ERP
          </h2>
          
          {uploadStatus === 'idle' && (
            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--theme-primary)' : '#cbd5e1'}`, borderRadius: 24, padding: 60,
                background: dragActive ? '#eff6ff' : '#f8fafc', textAlign: 'center', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
              }}
            >
              <Upload size={48} color={dragActive ? 'var(--theme-primary)' : '#94a3b8'} />
              <div style={{ color: 'var(--text-main)', fontWeight: 800 }}>Drag & Drop your populated templates here</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>Supports .xlsx, .xls, .csv</div>
              <button onClick={simulateUpload} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#0f172a', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                Browse Files
              </button>
            </div>
          )}

          {uploadStatus === 'parsing' && (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, border: '4px solid #f1f5f9', borderTopColor: 'var(--theme-primary)', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
              <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: 16 }}>Parsing Records...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, marginTop: 8 }}>Mapping fields to database schema</div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div style={{ padding: 60, textAlign: 'center', background: '#f0fdf4', borderRadius: 24, border: '1px solid #bbf7d0' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 24px' }} />
              <div style={{ color: '#065f46', fontWeight: 900, fontSize: 20 }}>Migration Successful!</div>
              <div style={{ color: '#166534', fontSize: 14, fontWeight: 600, marginTop: 12 }}>
                Imported 254 Employee Records<br/>
                Imported 8,432 Payroll Histories
              </div>
              <button onClick={() => setUploadStatus('idle')} style={{ marginTop: 24, padding: '12px 24px', borderRadius: 12, background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                Upload Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Migration;
