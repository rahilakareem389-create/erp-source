import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Search, Check, X, Eye, Package, RotateCcw, AlertTriangle } from 'lucide-react';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5002/api/returns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReturns(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionType, payload = {}) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      let url = `http://localhost:5002/api/returns/${id}`;
      
      if (actionType === 'approve' || actionType === 'reject') {
        url += '/status';
        payload.status = actionType;
      } else if (actionType === 'receive') {
        url += '/receive';
      } else if (actionType === 'complete') {
        url += '/complete';
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchReturns();
        if (selectedReturn && selectedReturn.id === id) {
           const updatedReturn = await res.json();
           setSelectedReturn(updatedReturn);
        }
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (ret) => {
    setSelectedReturn(ret);
    setShowDetailModal(true);
  };

  const filteredReturns = returns.filter(r => 
    r.returnNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.Customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#fef3c7', color: '#d97706' };
      case 'approved': return { bg: '#dcfce7', color: '#16a34a' };
      case 'rejected': return { bg: '#fee2e2', color: '#ef4444' };
      case 'received': return { bg: '#e0e7ff', color: '#4f46e5' };
      case 'verified': return { bg: '#f3e8ff', color: '#9333ea' };
      case 'completed': return { bg: '#d1fae5', color: '#059669' };
      default: return { bg: '#f1f5f9', color: 'var(--text-muted)' };
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px', margin: 0 }}>Returns Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 500, marginTop: 4 }}>Process customer returns, refunds, and inventory updates.</p>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-body)', borderLeft: '4px solid #3b82f6', padding: '12px 16px', borderRadius: 8 }}>
            <strong>Policy & Instructions:</strong> Accept returns within 30 days. Deduct restocking fees if item is not in original condition. Delivery/pickup must be arranged.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search return # or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '12px 16px 12px 42px', borderRadius: 12, border: '1px solid var(--border-main)', background: 'var(--bg-surface)', width: 280, outline: 'none' }}
            />
          </div>
          <button onClick={fetchReturns} style={{ padding: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-main)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCcw size={18} color="#64748b" />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading returns...</div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 24, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: 'var(--text-muted)', fontSize: 13 }}>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>RETURN #</th>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>DATE</th>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>CUSTOMER</th>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>AMOUNT</th>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '16px 12px', fontWeight: 700 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map(ret => (
                <tr key={ret.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 700, color: 'var(--text-main)' }}>{ret.returnNumber}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: 14 }}>{new Date(ret.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-main)', fontWeight: 600 }}>{ret.Customer?.name || 'Unknown'}</td>
                  <td style={{ padding: '16px 12px', fontWeight: 800, color: 'var(--text-main)' }}>${parseFloat(ret.totalRefund || 0).toFixed(2)}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      background: getStatusColor(ret.status).bg, 
                      color: getStatusColor(ret.status).color,
                      padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {ret.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button onClick={() => openDetails(ret)} style={{ padding: '6px 12px', background: 'var(--bg-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-main)' }}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No returns found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Return Details Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReturn && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 32 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ background: 'var(--bg-surface)', borderRadius: 24, width: '90%', maxWidth: 800, position: 'relative', padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Return {selectedReturn.returnNumber}</h2>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ 
                      background: getStatusColor(selectedReturn.status).bg, 
                      color: getStatusColor(selectedReturn.status).color,
                      padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {selectedReturn.status}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Requested: {new Date(selectedReturn.requestedAt || selectedReturn.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Customer Details</h3>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedReturn.Customer?.name || 'N/A'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)' }}>{selectedReturn.Customer?.phone || ''}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)' }}>{selectedReturn.Customer?.email || ''}</div>
                </div>
                <div style={{ background: 'var(--bg-body)', padding: 16, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Original Order</h3>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Order ID: {selectedReturn.Sale?.id?.slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)' }}>Order Status: {selectedReturn.Sale?.orderStatus}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)' }}>Total: ${parseFloat(selectedReturn.Sale?.totalAmount || 0).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>Reason & Notes</h3>
                <div style={{ padding: 16, background: 'var(--bg-hover)', borderRadius: 12, fontSize: 14, color: 'var(--text-main)', borderLeft: '4px solid #cbd5e1' }}>
                  <strong>Reason:</strong> {selectedReturn.returnReason}<br/>
                  <strong>Customer Note:</strong> {selectedReturn.notes || 'None'}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>Items to Return</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 8px' }}>PRODUCT</th>
                      <th style={{ padding: '12px 8px' }}>QTY</th>
                      <th style={{ padding: '12px 8px' }}>CONDITION</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>REFUND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturn.ReturnItems?.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-main)' }}>{item.Product?.name}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ padding: '4px 8px', background: '#e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{item.condition}</span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800 }}>${parseFloat(item.refundAmount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 800, color: 'var(--text-muted)' }}>TOTAL REFUND:</td>
                      <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 900, color: 'var(--text-main)', fontSize: 18 }}>${parseFloat(selectedReturn.totalRefund).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                {selectedReturn.status === 'pending' && (
                  <>
                    <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} style={{ padding: '12px 24px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Reject Return</button>
                    <button onClick={() => handleAction(selectedReturn.id, 'approve')} disabled={actionLoading} style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Approve Return</button>
                  </>
                )}
                {selectedReturn.status === 'approved' && (
                  <button onClick={() => handleAction(selectedReturn.id, 'receive', { itemsConditions: selectedReturn.ReturnItems.map(i => ({returnItemId: i.id, condition: 'Good'})) })} disabled={actionLoading} style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={18} /> Mark as Received
                  </button>
                )}
                {(selectedReturn.status === 'received' || selectedReturn.status === 'verified') && (
                  <button onClick={() => handleAction(selectedReturn.id, 'complete')} disabled={actionLoading} style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={18} /> Complete & Process Refund
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, position: 'relative' }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Reject Return</h3>
              <textarea 
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--border-main)', minHeight: 100, marginBottom: 24, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowRejectModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleAction(selectedReturn.id, 'reject', { rejectionReason })} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Confirm Reject</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Returns;
