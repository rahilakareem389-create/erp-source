import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ArrowLeft, RefreshCcw, PackageX, LogIn } from 'lucide-react';

const CustomerOrders = () => {
  const [customer, setCustomer] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Auto-login if token is already present
  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (token) {
      const storedCustomer = JSON.parse(localStorage.getItem('customerData'));
      setCustomer(storedCustomer);
      fetchCustomerData(storedCustomer.id, token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5002/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.user);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify(data.user));
        fetchCustomerData(data.user.id, data.token);
      } else {
        const err = await res.json();
        alert(err.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    setCustomer(null);
    setOrders([]);
    setReturns([]);
  };

  const fetchCustomerData = async (customerId, token) => {
    setLoading(true);
    try {
      // Fetch orders, returns, and products
      const [salesRes, returnsRes, productsRes] = await Promise.all([
        fetch(`http://localhost:5002/api/sales/customer/${customerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5002/api/returns/customer/${customerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:5002/api/inventory/public/products`)
      ]);
      
      if (salesRes.ok) setOrders(await salesRes.json());
      if (returnsRes.ok) setReturns(await returnsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const token = localStorage.getItem('customerToken');
    
    const items = cart.map(i => ({
      productId: i.id,
      quantity: i.qty,
      price: i.price
    }));
    const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    try {
      const res = await fetch('http://localhost:5002/api/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: customer.id,
          customerName: customer.name,
          items,
          totalAmount,
          grandTotal: totalAmount,
          paymentMethod: 'cash',
          cashAmount: totalAmount,
          discount: 0, tax: 0,
          notes: orderNotes,
          orderStatus: 'Pending'
        })
      });
      if (res.ok) {
        alert('Order placed successfully!');
        setCart([]);
        setOrderNotes('');
        setShowCheckoutModal(false);
        setActiveTab('orders');
        fetchCustomerData(customer.id, token);
      } else {
        const err = await res.json();
        alert('Failed to place order: ' + err.message);
      }
    } catch (e) {
      alert('Error placing order');
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    // Initialize return quantities to 0
    setReturnItems(order.Items.map(item => ({
      saleItemId: item.id,
      productId: item.productId,
      name: item.Product?.name || 'Item',
      purchasedQty: item.quantity,
      price: item.price,
      returnQty: 0
    })));
    setReturnReason('');
    setCustomerNotes('');
    setShowReturnModal(true);
  };

  const handleQuantityChange = (saleItemId, qty, maxQty) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItems(prev => prev.map(item => 
      item.saleItemId === saleItemId ? { ...item, returnQty: validQty } : item
    ));
  };

  const submitReturn = async () => {
    const itemsToReturn = returnItems.filter(i => i.returnQty > 0).map(i => ({
      saleItemId: i.saleItemId,
      productId: i.productId,
      quantity: i.returnQty
    }));

    if (itemsToReturn.length === 0) {
      return alert('Please select at least one item to return');
    }
    if (!returnReason) {
      return alert('Please select a return reason');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('customerToken');
      const res = await fetch('http://localhost:5002/api/returns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          saleId: selectedOrder.id,
          customerId: customer.id,
          returnReason,
          notes: customerNotes,
          returnItems: itemsToReturn
        })
      });

      if (res.ok) {
        alert('Return request submitted successfully!');
        setShowReturnModal(false);
        fetchCustomerData(customer.id, token);
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5002/api/auth/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, name: nameInput, phone: phoneInput })
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.user);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify(data.user));
        fetchCustomerData(data.user.id, data.token);
      } else {
        const err = await res.json();
        alert(err.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'var(--bg-surface)', padding: 40, borderRadius: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ background: '#e0e7ff', width: 64, height: 64, borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <ShoppingBag size={32} color="#4f46e5" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>Customer Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>{isRegistering ? 'Create an account to shop and track orders.' : 'Enter your email to view your orders and process returns.'}</p>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-main)', marginBottom: 16, outline: 'none', fontSize: 16 }}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-main)', marginBottom: 16, outline: 'none', fontSize: 16 }}
                />
              </>
            )}
            <input 
              type="email" 
              placeholder="customer@example.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-main)', marginBottom: 16, outline: 'none', fontSize: 16 }}
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#4f46e5', color: 'white', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {loading ? 'Verifying...' : (isRegistering ? <><LogIn size={18} /> Register</> : <><LogIn size={18} /> Sign In</>)}
            </button>
            <div style={{ marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
              {isRegistering ? 'Already have an account?' : 'New here?'} 
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 800, cursor: 'pointer', marginLeft: 4 }}>
                {isRegistering ? 'Sign In' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Welcome, {customer.name}</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>Manage your orders and shop products.</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#fef2f2', color: '#ef4444', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setActiveTab('store')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'store' ? '#0f172a' : '#f8fafc', color: activeTab === 'store' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>Shop Products</button>
          <button onClick={() => setActiveTab('orders')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'orders' ? '#0f172a' : '#f8fafc', color: activeTab === 'orders' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>My Orders</button>
          <button onClick={() => setActiveTab('returns')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: activeTab === 'returns' ? '#0f172a' : '#f8fafc', color: activeTab === 'returns' ? 'white' : '#64748b', fontWeight: 800, cursor: 'pointer' }}>My Returns</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontWeight: 600 }}>Loading...</div>
        ) : activeTab === 'store' ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-surface)', padding: 20, borderRadius: 16, border: '1px solid var(--border-main)', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{p.name}</h3>
                  <p style={{ margin: '0 0 16px 0', color: 'var(--theme-primary)', fontWeight: 800 }}>Rs. {p.price}</p>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '8px', background: 'var(--bg-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Add to Cart</button>
                </div>
              ))}
            </div>
            <div style={{ width: 300, background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-main)' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Your Cart</h3>
              {cart.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Cart is empty</p> : (
                <div>
                  {cart.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                      <span>{i.name} (x{i.qty})</span>
                      <span>Rs. {i.price * i.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total:</span>
                    <span>Rs. {cart.reduce((s, i) => s + (i.price * i.qty), 0)}</span>
                  </div>
                  <button onClick={() => setShowCheckoutModal(true)} style={{ width: '100%', padding: 12, background: 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, marginTop: 16, cursor: 'pointer' }}>Checkout</button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-body)', padding: 16, borderRadius: 12, borderLeft: '4px solid var(--theme-primary)' }}>
              <strong>Delivery Instructions:</strong> Orders are typically delivered within 2-4 business days. For any issues during delivery or if you want to leave specific instructions, please use the Message feature when placing an order.
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, color: 'var(--text-main)', fontWeight: 700 }}>No orders found</h3>
              </div>
            ) : (
              orders.map(order => {
                const canReturn = order.orderStatus === 'Delivered';
                return (
                  <div key={order.id} style={{ background: 'var(--bg-surface)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-main)' }}>
                    <div style={{ padding: '20px 24px', background: 'var(--bg-body)', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Order Placed</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Rs. {parseFloat(order.grandTotal).toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                        <div style={{ padding: '6px 12px', background: order.orderStatus === 'Delivered' ? '#dcfce7' : '#fef9c3', color: order.orderStatus === 'Delivered' ? '#16a34a' : '#ca8a04', borderRadius: 12, fontWeight: 700, fontSize: 12 }}>
                          {order.orderStatus}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '24px' }}>
                      {order.Items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>{item.Product?.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            Rs. {parseFloat(item.total).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {canReturn && (
                        <div style={{ marginTop: 24, textAlign: 'right' }}>
                          <button onClick={() => openReturnModal(order)} style={{ padding: '10px 20px', background: 'var(--bg-body)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <RefreshCcw size={16} /> Request Return
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-body)', padding: 16, borderRadius: 12, borderLeft: '4px solid #ef4444' }}>
              <strong>Returns Policy:</strong> Returns are accepted within 30 days of delivery. Refunds are credited to your account balance after inspection. Note: delivery or restocking charges may be deducted.
            </div>
            {returns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', borderRadius: 24, border: '1px dashed #cbd5e1' }}>
                <PackageX size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, color: 'var(--text-main)', fontWeight: 700 }}>No returns found</h3>
              </div>
            ) : (
              returns.map(ret => (
                <div key={ret.id} style={{ background: 'var(--bg-surface)', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-main)', padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>Return ID: {ret.id.slice(0,8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date: {new Date(ret.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ padding: '6px 12px', background: ret.status === 'completed' ? '#dcfce7' : '#fef9c3', color: ret.status === 'completed' ? '#16a34a' : '#ca8a04', borderRadius: 12, fontWeight: 700, fontSize: 12 }}>
                      {ret.status.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 700 }}>Refund Amount: ${parseFloat(ret.totalRefund).toFixed(2)}</div>
                  {ret.notes && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 8 }}>"{ret.notes}"</div>}
                </div>
              ))
            )}
          </div>
        )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 32 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckoutModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ background: 'var(--bg-surface)', borderRadius: 24, width: '100%', maxWidth: 500, position: 'relative', padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Confirm Order</h2>
                <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <PackageX size={24} />
                </button>
              </div>

              <div style={{ marginBottom: 24, background: 'var(--bg-body)', padding: 16, borderRadius: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Order Summary</div>
                {cart.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                    <span>{i.name} x {i.qty}</span>
                    <span style={{ fontWeight: 700 }}>Rs. {i.price * i.qty}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontWeight: 900, fontSize: 18 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--theme-primary)' }}>Rs. {cart.reduce((s, i) => s + (i.price * i.qty), 0)}</span>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Message for Manager (Optional)</label>
                <textarea 
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Special instructions or comments..."
                  style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--border-main)', minHeight: 80, outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, padding: 14, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button onClick={placeOrder} style={{ flex: 1, padding: 14, background: 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Confirm Order</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: 32 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReturnModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ background: 'var(--bg-surface)', borderRadius: 24, width: '100%', maxWidth: 700, position: 'relative', padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Request Return</h2>
                <button onClick={() => setShowReturnModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <PackageX size={24} />
                </button>
              </div>

              {/* Return Policy */}
              <div style={{ background: 'var(--bg-body)', borderLeft: '4px solid #3b82f6', padding: 16, borderRadius: 12, marginBottom: 32 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Return Policy</h4>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <li>Returns available within 30 days after delivery.</li>
                  <li>Product must be unused / in acceptable condition.</li>
                  <li>Refund will be credited to your account balance after inspection.</li>
                  <li style={{ color: '#ef4444' }}>Note: Applicable delivery or restocking charges may be deducted from your final refund based on item condition.</li>
                </ul>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Select Items to Return</h3>
                {returnItems.map(item => (
                  <div key={item.saleItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-main)', borderRadius: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Purchased: {item.purchasedQty} @ ${parseFloat(item.price).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Return Qty:</span>
                      <input 
                        type="number" 
                        min="0" 
                        max={item.purchasedQty} 
                        value={item.returnQty}
                        onChange={(e) => handleQuantityChange(item.saleItemId, parseInt(e.target.value) || 0, item.purchasedQty)}
                        style={{ width: 60, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Return Reason *</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border-main)', background: 'var(--bg-surface)', fontWeight: 600 }}>
                  <option value="">Select a reason...</option>
                  <option value="Damaged product">Damaged product</option>
                  <option value="Wrong product received">Wrong product received</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Product not as described">Product not as described</option>
                  <option value="Missing item">Missing item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Additional Comments (Optional)</label>
                <textarea 
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="Tell us more about the issue..."
                  style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--border-main)', minHeight: 100, outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                <button onClick={() => setShowReturnModal(false)} style={{ padding: '12px 24px', background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-main)', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                <button onClick={submitReturn} disabled={loading} style={{ padding: '12px 24px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                  {loading ? 'Submitting...' : 'Submit Return'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerOrders;
