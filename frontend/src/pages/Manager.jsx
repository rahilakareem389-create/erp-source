import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, DollarSign, ShoppingCart, Package, 
  ArrowUpRight, AlertTriangle, RefreshCcw, FileText,
  Check, X, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { managerAPI, returnAPI } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Manager = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    revenue: 0, salesToday: 0, salesCount: 0, pendingOrders: 0, 
    totalProducts: 0, lowStockProducts: 0, totalReturns: 0, pendingReturns: 0, recentSales: []
  });
  const [salesData, setSalesData] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('30d');

  const fetchData = async () => {
    try {
      const [dashRes, chartRes, returnRes] = await Promise.all([
        managerAPI.getDashboard(),
        managerAPI.getSalesSummary(chartRange),
        returnAPI.getAll()
      ]);
      setDashboard(dashRes.data);
      setSalesData(chartRes.data);
      setReturns(returnRes.data.filter(r => r.status === 'pending').slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch manager data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, [chartRange]);

  const handleReturnAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await returnAPI.updateStatus(id, 'approved');
        await returnAPI.complete(id); // auto complete for simplicity, or we could have a separate complete step
      } else {
        await returnAPI.updateStatus(id, 'rejected');
      }
      fetchData();
    } catch (error) {
      alert("Error processing return: " + (error.response?.data?.message || error.message));
    }
  };

  const handleOrderStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5002/api/sales/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      fetchData();
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const StatBox = ({ title, value, sub, icon, rgb }) => (
    <div style={{ background: 'var(--bg-surface)', padding: 28, borderRadius: 28, border: '1px solid var(--border-main)', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
        <div style={{ width: 50, height: 50, borderRadius: 16, background: `rgba(${rgb}, 0.1)`, color: `rgb(${rgb})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>{value !== undefined ? value : '...'}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ padding: 40, minHeight: '100vh', background: 'var(--bg-body)', fontFamily: "'Outfit', sans-serif" }}>
      <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Manager Portal</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)' }}>Sales & Inventory Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/sales')} style={{ padding: '12px 24px', borderRadius: 14, background: 'var(--theme-primary)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} /> Point of Sale
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
        <StatBox title="Today's Sales" value={`$${(dashboard.salesToday || 0).toLocaleString()}`} sub={`${dashboard.salesCount || 0} transactions`} icon={<DollarSign />} rgb="34,197,94" />
        <StatBox title="Monthly Revenue" value={`$${(dashboard.revenue || 0).toLocaleString()}`} sub="This billing cycle" icon={<TrendingUp />} rgb="var(--theme-primary-rgb)" />
        <StatBox title="Pending Orders" value={dashboard.pendingOrders || 0} sub="Held transactions" icon={<ShoppingCart />} rgb="249,115,22" />
        <StatBox title="Low Stock Alerts" value={dashboard.lowStockProducts || 0} sub="Products below threshold" icon={<AlertTriangle />} rgb="239,68,68" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, marginBottom: 32 }}>
        {/* Sales Chart */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 32, border: '1px solid var(--border-main)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>Revenue Overview</h2>
            <select 
              value={chartRange} 
              onChange={e => setChartRange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-main)', outline: 'none' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          <div style={{ height: 300 }}>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="total" stroke="var(--theme-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No sales data available for this range
              </div>
            )}
          </div>
        </div>

        {/* Pending Returns */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 32, border: '1px solid var(--border-main)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>Return Requests</h2>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              {dashboard.pendingReturns} Pending
            </div>
          </div>
          <div style={{ marginBottom: 24, fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-body)', padding: 12, borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
            <strong>Policy:</strong> Returns allowed within 30 days. Deduct delivery/restocking fees if applicable before approving.
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {returns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                No pending returns
              </div>
            ) : returns.map(ret => (
              <div key={ret.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderRadius: 20, background: 'var(--bg-body)', border: '1px solid var(--border-main)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCcw size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>{ret.Customer?.name || 'Walk-in'} - ${ret.totalRefund}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Sale: {ret.saleId?.slice(0, 8)}</div>
                  {ret.returnReason && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 4 }}>Reason: {ret.returnReason}</div>}
                  {ret.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>"{ret.notes}"</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleReturnAction(ret.id, 'approve')} style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleReturnAction(ret.id, 'reject')} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Online Orders */}
      {dashboard.pendingOnlineOrders && dashboard.pendingOnlineOrders.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 32, border: '1px solid var(--border-main)', padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>Pending Online Orders</h2>
            <div style={{ background: '#fef9c3', color: '#ca8a04', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
              {dashboard.pendingOnlineOrders.length} New
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {dashboard.pendingOnlineOrders.map(order => (
              <div key={order.id} style={{ padding: 20, borderRadius: 20, background: 'var(--bg-body)', border: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800 }}>Order #{order.id.slice(0,8)}</div>
                  <div style={{ fontWeight: 800, color: '#10b981' }}>${order.grandTotal}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <div>Customer: {order.customerName || 'Online Client'}</div>
                  {order.notes && <div style={{ marginTop: 8, fontStyle: 'italic' }}>Message: "{order.notes}"</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleOrderStatus(order.id, 'Delivered')} style={{ flex: 1, padding: '8px', background: 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Accept / Deliver</button>
                  <button onClick={() => handleOrderStatus(order.id, 'Cancelled')} style={{ flex: 1, padding: '8px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancel Order</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
        {/* Recent Orders */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 32, border: '1px solid var(--border-main)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>Recent Sales / Orders</h2>
            <button onClick={() => navigate('/sales')} style={{ background: 'transparent', border: 'none', color: 'var(--theme-primary)', fontWeight: 800, cursor: 'pointer' }}>
              View All
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)', fontSize: 13, textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', fontWeight: 700 }}>Order ID</th>
                <th style={{ padding: '12px 8px', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: '12px 8px', fontWeight: 700 }}>Cashier</th>
                <th style={{ padding: '12px 8px', fontWeight: 700 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentSales?.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>
                    No recent sales
                  </td>
                </tr>
              ) : dashboard.recentSales?.map(sale => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 8px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{sale.id.slice(0, 8)}...</td>
                  <td style={{ padding: '16px 8px', fontSize: 14, fontWeight: 800, color: '#10b981' }}>${sale.grandTotal}</td>
                  <td style={{ padding: '16px 8px', fontSize: 14, color: 'var(--text-muted)' }}>{sale.User?.name || 'Unknown'}</td>
                  <td style={{ padding: '16px 8px', fontSize: 14, color: 'var(--text-muted)' }}>{new Date(sale.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Quick Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 32, padding: 32, color: 'white' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={20} color="var(--theme-primary)" /> Inventory Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Total Products</span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{dashboard.totalProducts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Low Stock Alerts</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: dashboard.lowStockProducts > 0 ? '#ef4444' : '#22c55e' }}>{dashboard.lowStockProducts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Total Returns Handled</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--theme-primary)' }}>{dashboard.totalReturns}</span>
              </div>
            </div>
            <button onClick={() => navigate('/inventory')} style={{ width: '100%', marginTop: 24, padding: '12px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manager;
